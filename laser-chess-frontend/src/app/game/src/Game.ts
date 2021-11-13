import { Injectable } from "@angular/core";
import { AuthService } from "src/app/auth/auth.service";
import { EventEmitterService } from "src/app/game/services/event-emitter.service";
import { GameEvent, GameState } from "../game.models";
import { GameWebsocketService } from "../services/gameService/game-websocket.service";
import { Board } from "./board";
import { Animations } from "./Display/Animations";
import { GameActions } from "./Display/Canvas/GameActions";
import { GameCanvas } from "./Display/Canvas/GameCanvas";
import { Drawings } from "./Display/Drawings";
import { Resources } from "./Display/Resources";
import { PlayerType } from "./enums";
import { EventsExecutor } from "./eventsExecutor";

@Injectable()
export class Game{

  gameCanvas!: GameCanvas
  gameActions!: GameActions
  gameId!: string
  sizeScale!: number
  showAnimations: boolean = true
  executingActions = false
  isInitiated = false

  constructor(private gameService: GameWebsocketService, private authService: AuthService, private eventEmitter: EventEmitterService, private eventsExecutor: EventsExecutor, private board: Board, private drawings: Drawings, private animations: Animations, private resources: Resources){
    if (this.eventEmitter.subsRefresh == undefined) {
      this.eventEmitter.subsRefresh = this.eventEmitter.invokeRefreshGameState.subscribe((value: GameState) => {
        this.refreshGameState(value);
      });
    }
  }

  get displaySize(){
    return (innerWidth > innerHeight ? innerHeight : innerWidth) * this.sizeScale
  }

  async initGame(gameCanvasContext: CanvasRenderingContext2D, blockSize: number, gameId: string, sizeScale: number){
    this.sizeScale = sizeScale
    this.gameId = gameId
    await this.resources.loadAssets()
    this.gameCanvas = new GameCanvas(this.gameService, this.authService, this.animations, this.drawings, gameCanvasContext, blockSize, this.resources, gameId)
    this.gameActions = new GameActions(this.gameService, this.eventEmitter, gameId)
    this.gameService.connect(this.gameId)
  }

  async loadDisplay(displaySize: number, receivedGameState: GameState){

      let gameState = this.gameService.getLocalGameState() || receivedGameState
      let animationsToShow = this.gameService.animationsToShow(receivedGameState.game_events.length)

      if((gameState != receivedGameState && animationsToShow <= 0)
      || gameState.game_events.length == receivedGameState.game_events.length
      || gameState.game_id != receivedGameState.game_id
      || animationsToShow > 5){

        gameState = receivedGameState
        this.gameService.setAnimationEventsNum(gameState.game_events.length)
        animationsToShow = 0
      }

      this.board.initBoard(gameState, displaySize)
      this.gameCanvas.initCanvas(this.board, this.gameActions)
      this.gameActions.initCanvas(this.gameCanvas)

      if(this.board.playerNum == PlayerType.PLAYER_TWO)
        this.flipBoard()

      if(animationsToShow > 0)
        await this.executePendingActions(receivedGameState.game_events, animationsToShow, this.showAnimations)

      this.board.currentTurn = receivedGameState.turn_number
      this.gameService.setLocalGameState(gameState)
      const myTurn = this.board.isMyTurn()
      this.gameCanvas.interactable = myTurn

      this.isInitiated = true
  }

  changeCurrentSize(newSize: number){
    this.board.changeCellCoordinates(newSize)
    this.gameCanvas.changeBlockSize(newSize, this.board)
  }

  changeAnimationsShowOption(show: boolean){
    this.showAnimations = show
    this.gameCanvas.showAnimations = this.showAnimations
  }

  async refreshGameState(newGameState: GameState){
    if(this.gameId){
      if(!this.isInitiated)
        this.loadDisplay(this.displaySize, newGameState)
      else {
      this.executingActions = true
      //this.gameService.setAnimationEventsNum(res.body.game_events.length)
      const animationsToShow = this.gameService.animationsToShow(newGameState.game_events.length)
      if(animationsToShow > 0)
        await this.executePendingActions(newGameState.game_events, animationsToShow, this.showAnimations)

      this.board.currentTurn = newGameState.turn_number

      this.gameService.setLocalGameState(this.board.serialize())
      this.gameService.setAnimationEventsNum(newGameState.game_events.length)
      const myTurn = this.board.isMyTurn()
      this.gameCanvas.interactable = myTurn

      this.executingActions = false

      if(this.gameService.lastMessage?.game_events && this.gameService.lastMessage != newGameState)
        this.refreshGameState(this.gameService.lastMessage)
    }

    }
    else
      console.error("Board not properly initialized")

  }

  showGameEvent(gameEvents: GameEvent[]){
    this.board.setInitialGameState()
    this.gameCanvas.redrawGame(this.board)
    this.executePendingActions(gameEvents, gameEvents.length, false, false)
    this.gameCanvas.interactable = false
  }

  private async executePendingActions(events: GameEvent[], animationsToShow: number, showAnimations: boolean, showLaser: boolean = true){
    this.gameCanvas.interactable = false
    this.eventsExecutor.addEventsToExecute(events.slice(-animationsToShow))
    await this.eventsExecutor.executeEventsQueue(this.gameCanvas, this.board, showAnimations, showLaser)
  }

  passRotation(degree: number){
    this.gameActions.rotationPressed(this.board, degree)
  }

  passLaserShoot(){
    this.gameActions.laserButtonPressed(this.board)
  }

  passAccept(){
    this.gameActions.acceptRotationButtonPressed(this.board)
  }

  closeWebsocketConnection(){
    this.gameService.closeConnection()
  }

  flipBoard(){
    this.gameCanvas.isReversed = !this.gameCanvas.isReversed
    this.gameCanvas.redrawGame(this.board)
  }

}

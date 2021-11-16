import { Injectable } from "@angular/core";
import { clone } from "lodash";
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
import { GamePhase, PlayerType } from "./enums";
import { EventsExecutor } from "./eventsExecutor";

enum analizeModes {
  ANALIZING = "ANALIZING",
  EXITING_ANALYZE_MODE = "EXITTING_ANALYZE_MODE",
  NOT_ANALIZING = "NOT_ANALIZING"
}

@Injectable()
export class Game{

  gameCanvas!: GameCanvas
  gameActions!: GameActions
  gameId!: string
  sizeScale!: number
  showAnimations: boolean = true
  executingActions = false
  isInitiated = false
  analizeMode = analizeModes.NOT_ANALIZING
  gamePhase: GamePhase = GamePhase.NOT_STARTED
  whoseTurn: PlayerType = PlayerType.NONE

  constructor(public gameService: GameWebsocketService, private authService: AuthService, private eventEmitter: EventEmitterService, private eventsExecutor: EventsExecutor, private board: Board, private drawings: Drawings, private animations: Animations, private resources: Resources){
    if (this.eventEmitter.subsRefresh == undefined) {
      this.eventEmitter.subsRefresh = this.eventEmitter.invokeRefreshGameState.subscribe((value: GameState) => {
        this.refreshGameState(value);
      });
    }

    if (this.eventEmitter.subsRollback == undefined) {
      this.eventEmitter.subsRollback = this.eventEmitter.invokeMoveRollback.subscribe((value: GameState) => {
          this.loadStaticGameState(value)
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

      this.board.initBoard(receivedGameState, displaySize)
      this.gameCanvas.initCanvas(this.board, this.gameActions)
      this.gameActions.initCanvas(this.gameCanvas)

      if(this.board.playerNum == PlayerType.PLAYER_TWO)
        this.flipBoard()

      this.gameService.setAnimationEventsNum(receivedGameState.game_events.length)
      const myTurn = this.board.isMyTurn()
      this.gameCanvas.interactable = myTurn

      console.log(myTurn)

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

  loadConcreteGameState(gameState: GameState){
    this.board.initBoard(gameState, this.displaySize)
    this.board.currentTurn = gameState.turn_number
    this.gameService.setAnimationEventsNum(gameState.game_events.length)
    this.gameCanvas.redrawGame(this.board)
    const myTurn = this.board.isMyTurn()
    this.gameCanvas.interactable = myTurn
  }

  loadStaticGameState(gameState: GameState){
    this.board.initBoard(gameState, this.displaySize)
    this.gameCanvas.redrawGame(this.board)
  }

  async loadNewGameState(newGameState: GameState){
    this.executingActions = true
    const animationsToShow = this.gameService.animationsToShow(newGameState.game_events.length)
    if(animationsToShow > 0)
      await this.executePendingActions(newGameState.game_events, animationsToShow, this.showAnimations)

    this.board.currentTurn = newGameState.turn_number

    this.gameService.setAnimationEventsNum(newGameState.game_events.length)
    const myTurn = this.board.isMyTurn()
    this.gameCanvas.interactable = myTurn

    this.executingActions = false

    if(this.gameService.lastMessage?.game_events && this.gameService.lastMessage != newGameState)
      this.refreshGameState(this.gameService.lastMessage)
  }

  async refreshGameState(newGameState: GameState){
    if(this.gameId){
      if(this.analizeMode != analizeModes.ANALIZING){
          if(!this.isInitiated)
            this.loadDisplay(this.displaySize, newGameState)
          else if(this.analizeMode == analizeModes.EXITING_ANALYZE_MODE){
            this.loadConcreteGameState(newGameState)
            this.analizeMode = analizeModes.NOT_ANALIZING
          }
          else
            this.loadNewGameState(newGameState)

        if(newGameState.game_phase != GamePhase.STARTED)
            this.gameCanvas.interactable = false

      }
    }
    else
      console.error("Board not properly initialized")

    this.gamePhase = newGameState.game_phase
    this.whoseTurn = this.board.isMyTurn() ? this.board.playerNum : this.board.opponentNum
  }

  showGameEvent(gameEvents: GameEvent[]){
    this.analizeMode = analizeModes.ANALIZING
    this.gameCanvas.interactable = false
    this.board.setInitialGameState(this.displaySize)
    this.executePendingActions(gameEvents, gameEvents.length, false, false)
  }

  returnToCurrentEvent(){
    this.analizeMode = analizeModes.EXITING_ANALYZE_MODE
    this.gameService.getGameState(this.gameId)
  }

  private async executePendingActions(events: GameEvent[], animationsToShow: number, showAnimations: boolean, showLaser: boolean = true){
    this.gameCanvas.interactable = false
    this.eventsExecutor.addEventsToExecute(events.slice(-animationsToShow))
    await this.eventsExecutor.executeEventsQueue(this.gameCanvas, this.board, showAnimations, showLaser)
  }

  giveUp(){
    this.gameService.giveUp(this.gameId)
  }

  offerDraw(){
    this.gameService.offerDraw(this.gameId)
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

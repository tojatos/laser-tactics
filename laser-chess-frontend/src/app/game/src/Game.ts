import { Injectable } from "@angular/core";
import { AuthService } from "src/app/auth/auth.service";
import { EventEmitterService } from "src/app/game/services/event-emitter.service";
import { GameEvent, GameState, LaserShotEvent } from "../game.models";
import { GameWebsocketService } from "../services/gameService/game-websocket.service";
import { Board } from "./board";
import { Animations } from "./Display/Animations";
import { GameActions } from "./Display/Canvas/GameActions";
import { GameCanvas } from "./Display/Canvas/GameCanvas";
import { Drawings } from "./Display/Drawings";
import { Resources } from "./Display/Resources";
import { GameEvents, GamePhase, PlayerType } from "./enums";
import { EventsExecutor } from "./eventsExecutor";

enum analizeModes {
  ANALYZING = "ANALYZING",
  EXITING_ANALYZE_MODE = "EXITING_ANALYZE_MODE",
  NOT_ANALYZING = "NOT_ANALYZING"
}

@Injectable()
export class Game{

  gameCanvas: GameCanvas | undefined
  gameActions: GameActions | undefined
  gameId: string | undefined
  sizeScale: number = 0
  showAnimations: boolean = true
  executingActions = false
  isInitiated = false
  analyzeMode = analizeModes.NOT_ANALYZING
  gamePhase: GamePhase = GamePhase.NOT_STARTED
  whoseTurn: PlayerType = PlayerType.NONE
  playerNames: [string | undefined, string | undefined] = [undefined, undefined]
  initialGameState!: GameState

  constructor(public gameService: GameWebsocketService,
    public authService: AuthService,
    private eventEmitter: EventEmitterService,
    private eventsExecutor: EventsExecutor,
    private board: Board,
    private drawings: Drawings,
    private animations: Animations,
    private resources: Resources){
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

  async initGame(gameCanvasContext: CanvasRenderingContext2D, blockSize: number, gameId: string, sizeScale: number, animations: boolean){
    this.sizeScale = sizeScale
    this.gameId = gameId
    this.initialGameState = await this.gameService.getInitialGameState()
    await this.resources.loadAssets()
    this.showAnimations = animations
    this.gameCanvas = new GameCanvas(this.gameService, this.authService, this.animations, this.drawings, gameCanvasContext, blockSize, this.resources, gameId)
    this.gameCanvas.showAnimations = this.showAnimations
    this.gameActions = new GameActions(this.gameService, this.eventEmitter, gameId)
    this.gameService.connect(this.gameId)
    this.gameCanvas.redrawGame(this.board)
  }

  destroyGame(){
    this.sizeScale = 0
    this.gameId = ""
    this.gameCanvas = undefined
    this.gameActions = undefined
    this.isInitiated = false
  }

  async loadDisplay(displaySize: number, receivedGameState: GameState){

    if(this.gameCanvas && this.gameActions){

      this.board.initBoard(receivedGameState, displaySize)
      this.gameCanvas.initCanvas(this.board, this.gameActions)
      this.gameActions.initCanvas(this.gameCanvas)

      this.gameService.setAnimationEventsNum(receivedGameState.game_events.length)
      const myTurn = this.board.isMyTurn()
      this.gameCanvas.interactable = myTurn

      this.playerNames = this.gameCanvas.isReversed ? [this.board.playerTwo, this.board.playerOne] : [this.board.playerOne, this.board.playerTwo]

      if(this.board.playerNum == PlayerType.PLAYER_TWO)
        this.flipBoard()

      this.isInitiated = true
    }
  }

  changeCurrentSize(newSize: number){
    if(this.gameCanvas){
      this.board.changeCellCoordinates(newSize)
      this.gameCanvas?.changeBlockSize(newSize, this.board)
    }
  }

  changeAnimationsShowOption(show: boolean){
    if(this.gameCanvas){
      this.showAnimations = show
      this.gameCanvas.showAnimations = this.showAnimations
    }
  }

  loadConcreteGameState(gameState: GameState){
    if(this.gameCanvas){
      this.board.initBoard(gameState, this.displaySize)
      this.board.currentTurn = gameState.turn_number
      this.gameService.setAnimationEventsNum(gameState.game_events.length)
      this.gameCanvas.redrawGame(this.board)
      const myTurn = this.board.isMyTurn()
      this.gameCanvas.interactable = myTurn
    }
  }

  loadStaticGameState(gameState: GameState){
    if(this.gameCanvas){
      this.board.initBoard(gameState, this.displaySize)
      this.gameCanvas.redrawGame(this.board)
    }
  }

  async loadNewGameState(newGameState: GameState){
    if(this.gameCanvas){
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
  }

  async refreshGameState(newGameState: GameState){
    if(this.gameId && this.gameCanvas){
      if(this.analyzeMode != analizeModes.ANALYZING){
          if(!this.isInitiated)
            this.loadDisplay(this.displaySize, newGameState)
          else if(this.analyzeMode == analizeModes.EXITING_ANALYZE_MODE){
            this.loadConcreteGameState(newGameState)
            this.analyzeMode = analizeModes.NOT_ANALYZING
          }
          else
            await this.loadNewGameState(newGameState)

        if(newGameState.game_phase != GamePhase.STARTED)
            this.gameCanvas.interactable = false

      }
    }
    else
      console.error("Board not properly initialized")

    this.gamePhase = newGameState.game_phase
    this.whoseTurn = this.board.turnOfPlayer || PlayerType.NONE

  if(newGameState.game_phase == GamePhase.PLAYER_ONE_VICTORY)
    this.whoseTurn = PlayerType.PLAYER_ONE
  else if(newGameState.game_phase == GamePhase.PLAYER_TWO_VICTORY)
    this.whoseTurn = PlayerType.PLAYER_TWO
  }

  async showGameEvent(gameEvents: GameEvent[]){
    if(this.gameCanvas){
      this.analyzeMode = analizeModes.ANALYZING
      this.gameCanvas.interactable = false
      this.board.setInitialGameState(this.initialGameState, this.displaySize)
      await this.executePendingActions(gameEvents, gameEvents.length, false, false)
      if(gameEvents.slice(-1)[0].event_type == GameEvents.LASER_SHOT_EVENT || gameEvents.slice(-1)[0].event_type == GameEvents.PIECE_DESTROYED_EVENT)
        for(let i = gameEvents.length-1; i > 0; i--)
          if(gameEvents[i].event_type == GameEvents.LASER_SHOT_EVENT){
            this.eventsExecutor.addEventsToExecute(gameEvents.slice(i, gameEvents.length))
            this.eventsExecutor.executeLaserAnimations(this.gameCanvas, this.board, (<unknown>gameEvents[i] as LaserShotEvent).laser_path, 0, false, true, 999999)
            this.eventsExecutor.eventsQueue = []
            i = -1
          }
    }
  }

  returnToCurrentEvent(){
    if(this.gameId){
      this.analyzeMode = analizeModes.EXITING_ANALYZE_MODE
      this.gameService.getGameState(this.gameId)
    }
  }

  private async executePendingActions(events: GameEvent[], animationsToShow: number, showAnimations: boolean, showLaser: boolean = true){
    if(this.gameCanvas){
      this.gameCanvas.interactable = false
      this.eventsExecutor.addEventsToExecute(events.slice(-animationsToShow))
      await this.eventsExecutor.executeEventsQueue(this.gameCanvas, this.board, showAnimations, showLaser)
    }
  }

  giveUp(){
    if(this.gameId)
      this.gameService.giveUp(this.gameId)
  }

  offerDraw(){
    if(this.gameId)
      this.gameService.offerDraw(this.gameId)
  }

  async rematch(){
  }

  passRotation(degree: number){
    if(this.gameActions)
      this.gameActions.rotationPressed(this.board, degree)
  }

  passLaserShoot(){
    if(this.gameActions)
      this.gameActions.laserButtonPressed(this.board)
  }

  passAccept(){
    if(this.gameActions)
      this.gameActions.acceptRotationButtonPressed(this.board)
  }

  closeWebsocketConnection(){
    this.gameService.closeConnection()
  }

  flipBoard(){
    if(this.gameCanvas){
      this.gameCanvas.isReversed = !this.gameCanvas.isReversed
      this.gameCanvas.redrawGame(this.board)
    }
  }

}

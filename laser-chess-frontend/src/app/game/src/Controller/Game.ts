import { Injectable, QueryList } from "@angular/core";
import { AuthService } from "src/app/auth/auth.service";
import { EventEmitterService } from "src/app/game/services/event-emitter.service";
import { UserService } from "src/app/services/user.service";
import { GameEvent, GameState, LaserShotEvent } from "../../game.models";
import { GameWebsocketService } from "../../services/game.service";
import { Board } from "../GameStateData/Board";
import { Animations } from "../Display/Animations";
import { GameActions } from "../Display/Canvas/GameActions";
import { GameCanvas } from "../Display/Canvas/GameCanvas";
import { Drawings } from "../Display/Drawings";
import { Resources } from "../Display/Resources";
import { GameEvents, GamePhase, PlayerType } from "../Utils/Enums";
import { EventsExecutor } from "./EventsExecutor";
import { ClockComponent } from "../../components/clock/clock.component";

enum analyzeModes {
  ANALYZING = "ANALYZING",
  EXITING_ANALYZE_MODE = "EXITING_ANALYZE_MODE",
  NOT_ANALYZING = "NOT_ANALYZING"
}

@Injectable()
export class Game{

  gameCanvas: GameCanvas | undefined
  gameActions: GameActions | undefined
  gameId: string | undefined
  sizeScale = 0
  showAnimations= true
  enableSounds = true
  executingActions = false
  isInitiated = false
  isTimed = false
  analyzeMode = analyzeModes.NOT_ANALYZING
  gamePhase: GamePhase = GamePhase.NOT_STARTED
  whoseTurn: PlayerType = PlayerType.NONE
  activeTurn: [boolean, boolean] = [false, false]
  playerNames: [string | undefined, string | undefined] = [undefined, undefined]
  playerRankings: [number, number] = [0, 0]
  playerRankingsChanges : [number | undefined, number | undefined] = [undefined, undefined]
  initialGameState!: GameState
  playerTimes: [number, number] = [0, 0]
  clocks: QueryList<ClockComponent> | undefined

  constructor(public gameService: GameWebsocketService,
    private userService: UserService,
    public authService: AuthService,
    private eventEmitter: EventEmitterService,
    private eventsExecutor: EventsExecutor,
    private board: Board,
    private drawings: Drawings,
    private animations: Animations,
    private resources: Resources){

    this.eventEmitter.subsRefresh.asObservable().subscribe(gameState => {
      void this.refreshGameState(<GameState>gameState)
    })

    this.eventEmitter.subsRollback.asObservable().subscribe(gameState => {
      this.loadStaticGameState(<GameState>gameState)
    })
  }

  get displaySize(): number{
    return (innerWidth > innerHeight ? innerHeight : innerWidth) * this.sizeScale
  }

  async initGame(canvas: HTMLCanvasElement, blockSize: number, gameId: string, sizeScale: number, animations: boolean, sounds: boolean, clocks: QueryList<ClockComponent>): Promise<void>{
    this.sizeScale = sizeScale
    this.gameId = gameId
    this.initialGameState = await this.gameService.getInitialGameState()
    await this.resources.loadAssets()
    this.showAnimations = animations
    this.enableSounds = sounds
    this.gameCanvas = new GameCanvas(this.gameService, this.authService, this.animations, this.drawings, canvas, blockSize, this.resources, gameId, this.enableSounds)
    this.gameCanvas.showAnimations = this.showAnimations
    this.gameActions = new GameActions(this.gameService, gameId)
    this.gameService.connect(this.gameId)
    this.gameCanvas.redrawGame(this.board)
    this.clocks = clocks
  }

  destroyGame(): void{
    this.sizeScale = 0
    this.gameId = ""
    this.gameCanvas = undefined
    this.gameActions = undefined
    this.isInitiated = false
    this.analyzeMode = analyzeModes.NOT_ANALYZING
    this.gamePhase = GamePhase.NOT_STARTED
    this.whoseTurn = PlayerType.NONE
    this.playerNames = [undefined, undefined]
    this.playerRankings = [0, 0]
    this.playerRankingsChanges = [undefined, undefined]
    this.playerTimes = [0, 0]
    this.clocks = undefined
  }

  async loadDisplay(displaySize: number, receivedGameState: GameState): Promise<void>{

    if(this.gameCanvas && this.gameActions){

      this.isTimed = receivedGameState.is_timed
      this.board.initBoard(receivedGameState, displaySize)
      this.gameCanvas.initCanvas(this.board, this.gameActions)
      this.gameActions.initCanvas(this.gameCanvas)

      if(this.board.playerNum == PlayerType.PLAYER_TWO)
      this.flipBoard()

      this.isInitiated = true

      this.gameService.setAnimationEventsNum(receivedGameState.game_events.length)
      const myTurn = this.board.isMyTurn()
      this.gameCanvas.interactable = myTurn

      this.playerNames = this.gameCanvas.isReversed ? [this.board.playerTwo, this.board.playerOne] : [this.board.playerOne, this.board.playerTwo]
      const p1 = await this.userService.getUserByUsername(this.playerNames[0])
      const p2 = await this.userService.getUserByUsername(this.playerNames[1])

      await this.gameRankingChanges(receivedGameState)

      if(p1 && p2){
        this.playerRankings[0] = p1.rating
        this.playerRankings[1] = p2.rating
      }
    }
  }

  changeCurrentSize(newSize: number): void{
    if(this.gameCanvas){
      this.board.changeCellCoordinates(newSize)
      this.gameCanvas?.changeBlockSize(newSize, this.board)
    }
  }

  changeAnimationsShowOption(show: boolean): void{
    if(this.gameCanvas){
      this.showAnimations = show
      this.gameCanvas.showAnimations = this.showAnimations
    }
  }

  changeSoundOption(sounds: boolean): void{
    if(this.gameCanvas){
      this.enableSounds = sounds
      this.gameCanvas.enableSounds = this.enableSounds
    }
  }

  loadConcreteGameState(gameState: GameState): void{
    if(this.gameCanvas){
      this.board.initBoard(gameState, this.displaySize)
      this.board.currentTurn = gameState.turn_number
      this.gameService.setAnimationEventsNum(gameState.game_events.length)
      this.gameCanvas.redrawGame(this.board)
      const myTurn = this.board.isMyTurn()
      this.gameCanvas.interactable = myTurn
    }
  }

  loadStaticGameState(gameState: GameState): void{
    if(this.gameCanvas){
      this.board.initBoard(gameState, this.displaySize)
      this.gameCanvas.redrawGame(this.board)
    }
  }

  async loadNewGameState(newGameState: GameState): Promise<void>{
    if(this.gameCanvas){
      this.executingActions = true
      const animationsToShow = this.gameService.animationsToShow(newGameState.game_events.length)
      if(animationsToShow > 0)
        await this.executePendingActions(newGameState.game_events, animationsToShow, this.showAnimations, this.enableSounds)
      else
        this.loadConcreteGameState(newGameState)

      this.board.currentTurn = newGameState.turn_number

      this.gameService.setAnimationEventsNum(newGameState.game_events.length)
      const myTurn = this.board.isMyTurn()
      this.gameCanvas.interactable = myTurn

      this.executingActions = false

      await this.gameRankingChanges(newGameState)

      if(this.gameService.lastMessage?.game_events && this.gameService.lastMessage != newGameState)
        void this.refreshGameState(this.gameService.lastMessage)
    }
  }

  async gameRankingChanges(gameState: GameState): Promise<void>{
    if(this.gameId && gameState.game_phase != GamePhase.NOT_STARTED && gameState.game_phase != GamePhase.STARTED){
      const info = await this.gameService.getGameInfo(this.gameId)
      if(info.player_one_rating && info.player_one_new_rating && info.player_two_rating && info.player_two_new_rating){
        const newRating1 = info.player_one_rating - info.player_one_new_rating
        const newRating2 = info.player_two_rating - info.player_two_new_rating
        if(info.player_one_username == this.playerNames[0]){
          this.playerRankingsChanges[0] = newRating1
          this.playerRankingsChanges[1] = newRating2
        }
        else if(info.player_two_username == this.playerNames[0]){
          this.playerRankingsChanges[1] = newRating1
          this.playerRankingsChanges[0] = newRating2
        }
      }
    }
  }

  async refreshGameState(newGameState: GameState): Promise<void>{
    if(this.gameId && this.gameCanvas){
      if(this.analyzeMode != analyzeModes.ANALYZING){
          if(!this.isInitiated)
            void this.loadDisplay(this.displaySize, newGameState)
          else if(this.analyzeMode == analyzeModes.EXITING_ANALYZE_MODE){
            this.loadConcreteGameState(newGameState)
            this.analyzeMode = analyzeModes.NOT_ANALYZING
          }
          else
            await this.loadNewGameState(newGameState)

        if(newGameState.game_phase != GamePhase.STARTED)
            this.gameCanvas.interactable = false

      }
    }
    else
      console.error("Board not properly initialized")


    this.whoseTurn = this.board.turnOfPlayer || PlayerType.NONE
    this.gamePhase = newGameState.game_phase

    if(this.gamePhase == GamePhase.STARTED){
      const p1Turn = this.whoseTurn === PlayerType.PLAYER_ONE
      this.activeTurn = this.gameCanvas ? this.gameCanvas.isReversed ? [!p1Turn, p1Turn] : [p1Turn, !p1Turn] : [false, false]
    }
    else
      this.activeTurn = [false, false]

    this.playerTimes = this.gameCanvas?.isReversed ? [newGameState.player_two_time_left, newGameState.player_one_time_left] : [newGameState.player_one_time_left, newGameState.player_two_time_left]

    if(newGameState.game_phase == GamePhase.PLAYER_ONE_VICTORY)
      this.whoseTurn = PlayerType.PLAYER_ONE
    else if (newGameState.game_phase == GamePhase.PLAYER_TWO_VICTORY)
      this.whoseTurn = PlayerType.PLAYER_TWO


  }

  async showGameEvent(gameEvents: GameEvent[]): Promise<void>{
    if(this.gameCanvas){
      this.analyzeMode = analyzeModes.ANALYZING
      this.gameCanvas.interactable = false
      this.board.setInitialGameState(this.initialGameState, this.displaySize)
      await this.executePendingActions(gameEvents, gameEvents.length, false, false, false)
      if(gameEvents.slice(-1)[0].event_type == GameEvents.LASER_SHOT_EVENT || gameEvents.slice(-1)[0].event_type == GameEvents.PIECE_DESTROYED_EVENT)
        for(let i = gameEvents.length-1; i > 0; i--)
          if(gameEvents[i].event_type == GameEvents.LASER_SHOT_EVENT){
            this.eventsExecutor.addEventsToExecute(gameEvents.slice(i, gameEvents.length))
            void this.eventsExecutor.executeLaserAnimations(this.gameCanvas, this.board, (<unknown>gameEvents[i] as LaserShotEvent).laser_path, 0, false, false, true, 999999)
            this.eventsExecutor.eventsQueue = []
            i = -1
          }
    }
  }

  returnToCurrentEvent(): void{
    if(this.gameId){
      this.analyzeMode = analyzeModes.EXITING_ANALYZE_MODE
      this.gameService.getGameState(this.gameId)
    }
  }

  private async executePendingActions(events: GameEvent[], animationsToShow: number, showAnimations: boolean, enableSounds: boolean, showLaser = true){
    if(this.gameCanvas){
      this.gameCanvas.interactable = false
      this.eventsExecutor.addEventsToExecute(events.slice(-animationsToShow))
      await this.eventsExecutor.executeEventsQueue(this.gameCanvas, this.board, showAnimations, enableSounds, showLaser)
    }
  }

  giveUp(): void{
    if(this.gameId)
      this.gameService.giveUp(this.gameId)
  }

  offerDraw(): void{
    if(this.gameId)
      this.gameService.offerDraw(this.gameId)
  }

  notifyTimeout(): void {
    if(this.gameId && this.whoseTurn && this.whoseTurn != PlayerType.NONE && this.gamePhase == GamePhase.STARTED )
      this.gameService.timeout(this.gameId, this.whoseTurn == PlayerType.PLAYER_ONE ? 1 : 2)
  }

  passRotation(degree: number): void{
    if(this.gameActions)
      void this.gameActions.rotationPressed(this.board, degree)
  }

  passLaserShoot(): void{
    if(this.gameActions)
      this.gameActions.laserButtonPressed(this.board)
  }

  passAccept(): void{
    if(this.gameActions)
      this.gameActions.acceptRotationButtonPressed(this.board)
  }

  closeWebsocketConnection(): void{
    this.gameService.closeConnection()
  }

  flipBoard(): void{
    if(this.gameCanvas){
      this.gameCanvas.isReversed = !this.gameCanvas.isReversed
      this.gameCanvas.redrawGame(this.board)
    }
  }
}

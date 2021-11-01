import { Injectable } from "@angular/core";
import { AuthService } from "src/app/auth/auth.service";
import { EventEmitterService } from "src/app/game/services/event-emitter.service";
import { GameService } from "src/app/game/services/game.service";
import { GameState } from "../game.models";
import { Board } from "./board";
import { Animations } from "./Display/Animations";
import { GameCanvas } from "./Display/Canvas/GameCanvas";
import { GUICanvas } from "./Display/Canvas/GUICanvas";
import { Drawings } from "./Display/Drawings";
import { Resources } from "./Display/Resources";
import { EventsExecutor } from "./eventsExecutor";

@Injectable()
export class Game{

  gameCanvas!: GameCanvas
  guiCanvas!: GUICanvas
  gameId!: string
  sizeScale!: number
  showAnimations: boolean = true

  constructor(private gameService: GameService, private authService: AuthService, private eventEmitter: EventEmitterService, private eventsExecutor: EventsExecutor, private board: Board, private drawings: Drawings, private animations: Animations, private resources: Resources){
    if (this.eventEmitter.subsRefresh == undefined) {
      this.eventEmitter.subsRefresh = this.eventEmitter.invokeRefreshGameState.subscribe(() => {
        this.refreshGameState();
      });
    }
  }

  async initGame(gameCanvasContext: CanvasRenderingContext2D, guiCanvasContext: CanvasRenderingContext2D, blockSize: number, gameId: string, sizeScale: number){
    this.sizeScale = sizeScale
    this.gameId = gameId
    await this.resources.loadAssets()
    this.gameCanvas = new GameCanvas(this.gameService, this.authService, this.eventEmitter, this.animations, this.drawings, gameCanvasContext, blockSize, this.resources, gameId)
    this.guiCanvas = new GUICanvas(this.gameService, this.authService, this.eventEmitter, this.animations, this.drawings, guiCanvasContext, blockSize, this.resources, gameId)
    this.loadDisplay(gameId, (innerWidth > innerHeight ? innerHeight : innerWidth) * this.sizeScale)
  }

  loadDisplay(gameId: string, displaySize: number){
    this.gameService.getGameState(gameId).then(
      async res => {
        if(res.body) {
          //this.gameService.setAnimationEventsNum(res.body.game_events.length)
          res.body.game_id = gameId
          let gameState = this.gameService.getLocalGameState() || res.body
          const animationsToShow = this.gameService.animationsToShow(res.body.game_events.length)
          if((gameState != res.body && animationsToShow <= 0) || gameState.game_events.length == res.body.game_events.length || gameState.game_id != res.body.game_id){
            gameState = res.body
            this.gameService.setAnimationEventsNum(gameState.game_events.length)
          }
          displaySize = (innerWidth > innerHeight ? innerHeight : innerWidth) * this.sizeScale
          this.board.initBoard(gameState, displaySize)
          this.gameCanvas.initCanvas(this.board, this.guiCanvas)
          this.guiCanvas.initCanvas(this.board, this.gameCanvas)

          if(animationsToShow > 0)
            await this.executePendingActions(res.body, animationsToShow)

          this.board.currentTurn = res.body.turn_number
          const myTurn = this.board.isMyTurn()
          this.gameCanvas.interactable = myTurn
          if(!myTurn)
            this.refreshGameState()
        }

      }
    )
  }

  changeCurrentSize(newSize: number){
    this.board.changeCellCoordinates(newSize)
    this.gameCanvas.changeBlockSize(newSize, this.board)
    this.guiCanvas.changeBlockSize(newSize)
  }

  changeAnimationsShowOption(show: boolean){
    this.showAnimations = show
    this.gameCanvas.showAnimations = this.showAnimations
  }

  refreshGameState(){
    if(this.gameId){
      this.gameService.getGameState(this.gameId).then(async res => {
        if(res.body){
          //this.gameService.setAnimationEventsNum(res.body.game_events.length)
          const animationsToShow = this.gameService.animationsToShow(res.body.game_events.length)
          if(animationsToShow > 0)
            await this.executePendingActions(res.body, animationsToShow)

          this.board.currentTurn = res.body.turn_number

          const myTurn = this.board.isMyTurn()
          this.gameCanvas.interactable = myTurn

          if(myTurn)
            return

          setTimeout(() => this.refreshGameState(), 500)

        }
        else
          console.error("Board not properly initialized")
      })
    }
  }

  private async executePendingActions(game: GameState, animationsToShow: number){
    console.log("executing actions")
    this.gameCanvas.interactable = false
    this.eventsExecutor.addEventsToExecute(game.game_events.slice(-animationsToShow))
    await this.eventsExecutor.executeEventsQueue(this.gameCanvas, this.board, this.showAnimations)
  }

}

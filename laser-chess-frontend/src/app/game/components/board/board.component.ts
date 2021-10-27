import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameState } from '../../game.models';
import { EventEmitterService } from '../../services/event-emitter.service';
import { GameService } from '../../services/game.service';
import { Board } from '../../src/board';
import { GameCanvas } from '../../src/Display/Canvas/GameCanvas';
import { GUICanvas } from '../../src/Display/Canvas/GUICanvas';
import { Resources } from '../../src/Display/Resources';
import { EventsExecutor } from '../../src/eventsExecutor';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements AfterViewInit, OnInit {
  @ViewChild('canvas', { static: true })
  canvasGame!: ElementRef<HTMLCanvasElement>

  @ViewChild('gui', { static: true })
  canvasGUI!: ElementRef<HTMLCanvasElement>

  gameId: string | undefined
  currentSize: number | undefined
  refreshInterval: number | undefined
  intervalIsPaused: boolean = false
  refreshingGameState: boolean = false

  constructor(private gameService: GameService, private route: ActivatedRoute, 
    private eventEmitterService: EventEmitterService, private gameCanvas: GameCanvas, private guiCanvas: GUICanvas, 
    private resources: Resources,
    private board: Board, private eventsExecutor: EventsExecutor){}

  ngOnInit() {
    if (this.eventEmitterService.subsRefresh == undefined) {
      this.eventEmitterService.subsRefresh = this.eventEmitterService.
      invokeRefreshGameState.subscribe(() => {
        console.log("refresh invoked!")
        this.refreshingGameState = false
        this.refreshGameState();
      });
    }
  }

  async ngAfterViewInit() {
    const gameCanvasContext = this.canvasGame.nativeElement.getContext('2d')
    if(!gameCanvasContext){
      alert("Couldnt load context")
      return
    }

    const guiCanvasContext = this.canvasGUI.nativeElement.getContext('2d')
    if(!guiCanvasContext){
      alert("Couldnt load context")
      return
    }

    await this.resources.loadAssets()

    this.route.params.subscribe(params => {

      this.gameId = params.id

      this.gameService.getGameState(params.id).then(
        res => {
          if(res.body) {
            //this.gameService.setAnimationEventsNum(res.body.game_events.length)
            res.body.game_id = params.id
            let gameState = this.gameService.getLocalGameState() || res.body
            const animationsToShow = this.gameService.animationsToShow(res.body.game_events.length)
            if((gameState != res.body && animationsToShow <= 0) || gameState.game_events.length == res.body.game_events.length || gameState.game_id != res.body.game_id){
              gameState = res.body
              this.gameService.setAnimationEventsNum(gameState.game_events.length)
            }
            this.currentSize = (innerWidth > innerHeight ? innerHeight : innerWidth) * 0.07
            this.board.initBoard(gameState, this.currentSize)
            this.gameCanvas.initCanvas(gameCanvasContext!, this.board, this.resources, this.currentSize, params.id)
            //this.guiCanvas.initCanvas(guiCanvasContext!, this.resources)
            if(animationsToShow > 0)
              this.executePendingActions(res.body, animationsToShow)
            this.board.currentTurn = res.body.turn_number
            const myTurn = this.board.isMyTurn()
            this.gameCanvas.interactable = myTurn
            if(!myTurn)
              this.refreshGameState()
          }

        }
      )
    })

  }

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent) {
    this.currentSize = (innerWidth > innerHeight ? innerHeight : innerWidth) * 0.07
    this.board.changeCellCoordinates(this.currentSize)
    this.gameCanvas.changeBlockSize(this.currentSize, this.board)
  }

  onClick(){
    this.gameCanvas.rotationButtonPressed(this.board)
  }

  laserShoot(){
    console.log("lazorShoot")
    this.gameCanvas.laserButtonPressed(this.board)
  }

  refreshGameState(){
    if(this.gameId){
      this.gameService.getGameState(this.gameId).then(async res => {
        console.log("request recveived!")
        if(res.body && this.currentSize){
          //this.gameService.setAnimationEventsNum(res.body.game_events.length)
          const animationsToShow = this.gameService.animationsToShow(res.body.game_events.length)
          if(animationsToShow > 0){
            console.log("new actions to execute! Proceeding...")
            await this.executePendingActions(res.body, animationsToShow)
          }

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
    await this.eventsExecutor.executeEventsQueue(this.board)
  }

}

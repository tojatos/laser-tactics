import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventEmitterService } from '../../services/event-emitter.service';
import { GameService } from '../../services/game.service';
import { Board } from '../../src/board';
import { Canvas } from '../../src/Canvas/Canvas';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('canvas', { static: true })
  canvasHTML!: ElementRef<HTMLCanvasElement>

  gameId: string | undefined
  currentSize: number | undefined
  refreshInterval: number | undefined
  intervalIsPaused: boolean = false

  constructor(private gameService: GameService, private route: ActivatedRoute, private eventEmitterService: EventEmitterService, private canvas: Canvas, private board: Board){}

  ngOnInit() {
    if (this.eventEmitterService.subsIntervalStart == undefined) {
      this.eventEmitterService.subsIntervalStart = this.eventEmitterService.
      invokeRefreshIntervalStart.subscribe(() => {
        this.refreshIntervalStart();
      });
    }

    if (this.eventEmitterService.subsRefresh == undefined) {
      this.eventEmitterService.subsRefresh = this.eventEmitterService.
      invokeRefreshGameState.subscribe(() => {
        this.refreshGameState();
      });
    }

    if (this.eventEmitterService.subsPause == undefined) {
      this.eventEmitterService.subsPause = this.eventEmitterService.
      invokeIntervalPause.subscribe(() => {
        this.toggleRefreshInterval();
      });
    }
  }

  ngAfterViewInit() {
    const canvasContext = this.canvasHTML.nativeElement.getContext('2d')
    if(canvasContext == null){
      alert("Couldnt load context")
      return
    }

    this.route.params.subscribe(params => {

      this.gameId = params.id
      this.gameService.getGameState(params.id).then(
        res => {
          if(res.body) {
            this.currentSize = (innerWidth > innerHeight ? innerHeight : innerWidth) * 0.07
            this.board.initBoard(res.body, this.currentSize)
            this.canvas.initCanvas(canvasContext!, this.board, this.currentSize, params.id)
            const myTurn = this.board.isMyTurn()
            this.canvas.interactable = myTurn
            if(!myTurn)
              this.refreshIntervalStart()
          }

        }
      )
    })

  }

  ngOnDestroy() {
    this.refreshIntervalStop()
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent) {
    this.currentSize = (innerWidth > innerHeight ? innerHeight : innerWidth) * 0.07
    this.board.changeCellCoordinates(this.currentSize)
    this.canvas.changeBlockSize(this.currentSize, this.board)
  }

  onClick(){
    this.canvas.rotationButtonPressed(this.board)
  }

  laserShoot(){
    this.canvas.laserButtonPressed(this.board)
  }

  refreshGameState(){
    if(this.gameId && !this.intervalIsPaused){
      this.gameService.getGameState(this.gameId).then(async res => {
        if(res.body && this.currentSize){
          //this.gameService.setAnimationEventsNum(res.body.game_events.length)

          this.canvas.interactable = false
          const animationsToShow =  this.gameService.numOfAnimationEvents - res.body.game_events.length
          console.log(animationsToShow)
          if(animationsToShow < 0) {
            this.intervalIsPaused = true
            for (const e of res.body.game_events.slice(animationsToShow)){
              await new Promise(resolve => setTimeout(resolve, 500))
              await this.canvas.getAnimationToExecute(this.board, e)
              this.board.executeEvent(e)
              this.canvas.drawings.drawGame(this.board.cells)
            }
            this.intervalIsPaused = false
          }
          this.gameService.setAnimationEventsNum(res.body.game_events.length)
          this.gameService.setGameState(res.body.board)
          this.board.currentTurn = res.body.turn_number
          const myTurn = this.board.isMyTurn()
          this.canvas.interactable = myTurn

          if(myTurn)
            this.refreshIntervalStop()

        }
      })
    }
  }

  refreshIntervalStart(){
    if(!this.refreshInterval || this.intervalIsPaused){
      this.refreshInterval = window.setInterval(() => { this.refreshGameState() }, 500)
      this.intervalIsPaused = false
    }
  }

  refreshIntervalStop(){
    window.clearInterval(this.refreshInterval)
    this.refreshInterval = undefined
  }

  toggleRefreshInterval(){
    this.intervalIsPaused = !this.intervalIsPaused
  }

}

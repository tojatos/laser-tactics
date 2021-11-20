import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameEvent } from '../../game.models';
import { COLS, ROWS } from '../../src/constants';
import { GamePhase, PlayerType } from '../../src/enums';
import { Game } from '../../src/Game';
import { BoardLogComponent } from '../board-log/board-log.component';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true })
  canvasGame!: ElementRef<HTMLCanvasElement>

  @ViewChild('logs', { static: true })
  logsComponent: ElementRef<BoardLogComponent> | undefined

  readonly sizeScale = 0.07
  readonly handsetSize = 835
  readonly handsetScale = 1.5
  readonly placeForGameLogSize = 1.35
  animation = true

  constructor(private route: ActivatedRoute, public game: Game) {}

  ngAfterViewInit() {
    const gameCanvasContext = this.canvasGame.nativeElement.getContext('2d')
    if(!gameCanvasContext){
      alert("Couldn't load context")
      return
    }

    this.route.params.subscribe(async params => {
      await this.game.initGame(gameCanvasContext,
        this.isHandset ? this.currentSize * this.handsetScale : this.currentSize,
        params.id,
        this.isHandset ? this.sizeScale * this.handsetScale : this.sizeScale)
    })
  }

  ngOnDestroy() {
    this.game.closeWebsocketConnection()
    this.game.destroyGame()
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent) {
    this.game.changeCurrentSize(this.isHandset ? this.currentSize * this.handsetScale : this.currentSize)
  }

  changeAnimationShowOption(){
    this.animation = !this.animation
    this.game.changeAnimationsShowOption(this.animation)
  }

  buttonPressEvent(event: string){
    switch(event){
      case "left": this.game.passRotation(-90); break
      case "right": this.game.passRotation(90); break
      case "laser": this.game.passLaserShoot(); break
      case "accept": this.game.passAccept(); break
    }
  }

  buildEvent(gameEvents: GameEvent[]){
    this.game.showGameEvent(gameEvents)
  }

  returnToCurrentEvent(){
    this.game.returnToCurrentEvent()
  }

  parseGamePhase(gamePhase: GamePhase){
    switch(gamePhase){
      case GamePhase.STARTED: {
        if(this.game.whoseTurn == PlayerType.PLAYER_ONE) return "Tura gracza czerwonego"
        else if(this.game.whoseTurn == PlayerType.PLAYER_TWO) return "Tura gracza niebieskiego"
        else return "Gra rozpoczęta. Tura nieokreślona"
      }
      case GamePhase.DRAW: return "Remis"
      case GamePhase.PLAYER_ONE_VICTORY: return "Zwyciestwo gracza czerwonego!"
      case GamePhase.PLAYER_TWO_VICTORY: return "Zwyciestwo gracza niebieskiego!"
      case GamePhase.NOT_STARTED: return "Gra nierozpoczęta"
      default: return "Pobieranie danych..."
    }
  }

  get isHandset(){
    return innerWidth <= this.handsetSize
  }

  get currentSize() {
    return (innerWidth > innerHeight ? innerHeight : innerWidth) * this.sizeScale
  }

  get containerHeight() {
    if(!this.isHandset)
      return this.currentSize * ROWS
    else
      return this.currentSize * ROWS * this.handsetScale
  }

  get containerWidth() {
    if(!this.isHandset)
      return this.currentSize * COLS
    else
      return this.currentSize * ROWS * this.handsetScale
  }

  get displayedContainerWidth() {
    if(this.isHandset)
      return this.containerWidth
    else
      return this.containerWidth * this.placeForGameLogSize
  }

  get rotationPossibleInfo() {
    return this.game.gameActions?.rotationActive
  }

  get laserPossibleInfo() {
    return this.game.gameActions?.laserActive
  }

  get acceptPossibleInfo() {
    return this.game.gameActions?.acceptActive
  }

}

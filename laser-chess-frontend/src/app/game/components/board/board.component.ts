import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameEvent } from '../../game.models';
import { COLS, ROWS } from '../../src/constants';
import { Game } from '../../src/Game';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true })
  canvasGame!: ElementRef<HTMLCanvasElement>

  @ViewChild('gui', { static: true })
  canvasGUI!: ElementRef<HTMLCanvasElement>

  readonly sizeScale = 0.07
  animation = true

  constructor(private route: ActivatedRoute, public game: Game) {}

  ngAfterViewInit() {
    const gameCanvasContext = this.canvasGame.nativeElement.getContext('2d')
    if(!gameCanvasContext){
      alert("Couldn't load context")
      return
    }

    this.route.params.subscribe(async params => {
      await this.game.initGame(gameCanvasContext, this.currentSize, params.id, this.sizeScale)
    })

  }

  ngOnDestroy() {
    this.game.closeWebsocketConnection()
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent) {
    this.game.changeCurrentSize(this.currentSize)
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

  get currentSize() {
    return (innerWidth > innerHeight ? innerHeight : innerWidth) * this.sizeScale
  }

  get containerHeight() {
    return this.currentSize * ROWS
  }

  get containerWidth() {
    return this.currentSize * COLS
  }

  get rotationPossibleInfo() {
    return this.game.gameActions.rotationActive
  }

  get laserPossibleInfo() {
    return this.game.gameActions.laserActive
  }

  get acceptPossibleInfo() {
    return this.game.gameActions.acceptActive
  }

}

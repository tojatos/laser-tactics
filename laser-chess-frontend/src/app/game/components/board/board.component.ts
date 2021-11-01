import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { COLS, ROWS } from '../../src/constants';
import { Game } from '../../src/Game';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true })
  canvasGame!: ElementRef<HTMLCanvasElement>

  @ViewChild('gui', { static: true })
  canvasGUI!: ElementRef<HTMLCanvasElement>

  readonly sizeScale = 0.07
  animation = true

  constructor(private route: ActivatedRoute, private game: Game) {}

  ngAfterViewInit() {
    const gameCanvasContext = this.canvasGame.nativeElement.getContext('2d')
    if(!gameCanvasContext){
      alert("Couldn't load context")
      return
    }

    const guiCanvasContext = this.canvasGUI.nativeElement.getContext('2d')
    if(!guiCanvasContext){
      alert("Couldn't load context")
      return
    }

    this.route.params.subscribe(async params => {
      await this.game.initGame(gameCanvasContext, guiCanvasContext, this.currentSize, params.id, this.sizeScale)
    })

  }

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent) {
    this.game.changeCurrentSize(this.currentSize)
  }

  changeAnimationShowOption(){
    this.animation = !this.animation
    this.game.changeAnimationsShowOption(this.animation)
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

}

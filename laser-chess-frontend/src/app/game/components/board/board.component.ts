import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

  sizeScale = 0.07

  constructor(private route: ActivatedRoute, private game: Game) {}

  ngAfterViewInit() {
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

    this.route.params.subscribe(async params => {
      const currentSize = (innerWidth > innerHeight ? innerHeight : innerWidth) * this.sizeScale
      await this.game.initGame(gameCanvasContext, guiCanvasContext, currentSize, params.id)
    })

  }

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent) {
    const currentSize = (innerWidth > innerHeight ? innerHeight : innerWidth) * 0.07
    this.game.changeCurrentSize(currentSize)
  }

}

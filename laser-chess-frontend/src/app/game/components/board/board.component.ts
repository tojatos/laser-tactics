import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { GameService } from '../../game.service';
import { Board } from '../../src/board';
import { Canvas } from '../../src/Canvas/canvas';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true })
  canvasHTML!: ElementRef<HTMLCanvasElement>

  board!: Board
  canvas!: Canvas

  constructor(private gameService: GameService){}

  ngAfterViewInit() {
    const canvasContext = this.canvasHTML.nativeElement.getContext('2d')
    if(canvasContext == null){
      alert("Couldnt load context")
      return
    }

    this.board = new Board()
    this.gameService.getGameState("string").then(
      res => {
        const blockSize = (innerWidth > innerHeight ? innerHeight : innerWidth) * 0.07
        this.board.initBoard(res, blockSize)
        this.canvas = new Canvas(canvasContext!, this.board, blockSize)
      }
    )
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent) {
    const newSize = (innerWidth > innerHeight ? innerHeight : innerWidth) * 0.07
    console.log(newSize)
    this.board.changeCellCoordinates(newSize)
    this.canvas.changeBlockSize(newSize, this.board)
  }


}

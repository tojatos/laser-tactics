import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { GameService } from '../../game.service';
import { Board } from '../../src/board';
import { Canvas } from '../../src/canvas/canvas';

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
    if(canvasContext == null)
      alert("xD")

    this.board = new Board()
    this.gameService.getGameState().then(
      res => {
        this.board.initBoard(res)
        this.canvas = new Canvas(canvasContext!, this.board)
      }
    )


  }

  play() {  }
}

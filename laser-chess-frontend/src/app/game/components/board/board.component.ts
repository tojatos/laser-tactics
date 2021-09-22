import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { GameService } from '../../game.service';
import { Board } from '../../src/Board';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>

  board!: Board

  constructor(private gameService: GameService){}

  ngAfterViewInit() {
    const canvasContext = this.canvas.nativeElement.getContext('2d')
    if(canvasContext == null)
      alert("xD")
    this.board = new Board(canvasContext!)
    this.gameService.getGameState().then(res => this.board.initBoard(res))
  }

  play() {  }
}

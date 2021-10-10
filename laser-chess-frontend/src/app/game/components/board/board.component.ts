import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { GameService } from '../../game.service';
import { Board } from '../../src/board';
import { Canvas } from '../../src/Canvas/Canvas';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true })
  canvasHTML!: ElementRef<HTMLCanvasElement>

  constructor(private gameService: GameService, private canvas: Canvas, private board: Board){}

  ngAfterViewInit() {
    const canvasContext = this.canvasHTML.nativeElement.getContext('2d')
    if(canvasContext == null){
      alert("Couldnt load context")
      return
    }

    this.gameService.getGameState("string").then(
      res => {
        if(res.body) {
          const blockSize = (innerWidth > innerHeight ? innerHeight : innerWidth) * 0.07
          this.board.initBoard(res.body, blockSize)
          this.canvas.initCanvas(canvasContext!, this.board, blockSize, "string")
        }
      }
    )
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent) {
    const newSize = (innerWidth > innerHeight ? innerHeight : innerWidth) * 0.07
    this.board.changeCellCoordinates(newSize)
    this.canvas.changeBlockSize(newSize, this.board)
  }

  onClick(){
    this.canvas.rotationButtonPressed(this.board)
  }

  laserShoot(){
    this.canvas.laserButtonPressed(this.board)
  }


}

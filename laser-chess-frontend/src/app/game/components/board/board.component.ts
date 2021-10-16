import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
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

  gameId: string | undefined
  currentSize: number | undefined

  constructor(private gameService: GameService, private authService: AuthService, private route: ActivatedRoute, private canvas: Canvas, private board: Board){}

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
            this.canvas.interactable = this.board.isMyTurn(this.authService.getCurrentJwtInfo().sub)
          }
        }
      )
    })
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
    if(this.gameId)
      this.gameService.getGameState(this.gameId).then(res => {
        if(res.body && this.currentSize){
          this.board.initBoard(res.body, this.currentSize)
          this.canvas.drawings.drawGame(this.board.cells)
          this.canvas.interactable = this.board.isMyTurn(this.authService.getCurrentJwtInfo().sub)
        }
      })
  }


}

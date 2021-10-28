import { AuthService } from "src/app/auth/auth.service"
import { EventEmitterService } from "../../../services/event-emitter.service"
import { Coordinates } from "../../../game.models"
import { GameService } from "../../../services/game.service"
import { Board } from "../../board"
import { Cell } from "../../cell"
import { Animations } from "../Animations"
import { Drawings } from "../Drawings"
import { Resources } from "../Resources"
import { Canvas } from "./AbstractCanvas"
import { GUICanvas } from "./GUICanvas"

export class GameCanvas extends Canvas {

    highlightColor: string = "yellow"
    hoveredCell: Cell | undefined
    currentPlayer = this.authService.getCurrentJwtInfo().sub

    constructor(private gameService: GameService,
      private authService: AuthService,
      private eventEmitter: EventEmitterService,
      private animations: Animations,
      drawings: Drawings,
      ctx: CanvasRenderingContext2D,
       blockSize: number,
       resources: Resources,
       gameId: string) {
        super(ctx, blockSize, drawings, resources, gameId)
    }

    initCanvas(board: Board, guiCanvas: GUICanvas){
      this.ctx.canvas.addEventListener('click', (e) => this.canvasOnclick(e, board), false)
      this.ctx.canvas.addEventListener('mousemove', (e) => this.canvasHover(e, board), false)
      this.drawings.drawGame(this, board.cells)
      this.interactable = board.isMyTurn()
    }

    private async canvasOnclick(event: MouseEvent, board: Board) {

      console.log("click!")
      console.log(this.getMousePos(event))
      console.log(this.interactable)

      if(!this.interactable)
        return

      const coor = this.getMousePos(event)
      const selectedCell = board.getSelectableCellByCoordinates(coor.x, coor.y, this.currentPlayer)

      this.interactable = false

      if(board.selectedCell){
        if(selectedCell){
          this.gameService.movePiece(this.gameId, board.selectedCell.coordinates, selectedCell.coordinates)
          await this.makeAMoveEvent(selectedCell.coordinates, board)
          this.gameService.increaseAnimationEvents()
          board.movePiece(board.selectedCell.coordinates, selectedCell.coordinates)
          this.gameService.setLocalGameState(board.serialize())
          this.drawings.drawGame(this, board.cells)
          board.currentTurn++
          this.eventEmitter.invokeRefresh()

        }
        this.unselectCellEvent(board)

      }
      else {
        if(selectedCell){
          this.selectCellEvent(selectedCell, board)
          //if(selectedCell.piece?.piece_type == PieceType.LASER)
            //this.drawings.drawLaserButton(this)
        }
      }

      const myTurn = board.isMyTurn()
      this.interactable = myTurn

    }

    private canvasHover(event: MouseEvent, board: Board) {
      if(board.selectedCell && this.interactable){
        const coor = this.getMousePos(event)
        const hoveredOver = board.getCellByCoordinates(coor.x, coor.y)
        if(hoveredOver && hoveredOver != this.hoveredCell){
          if(board.selectedCell.possibleMoves(board)?.includes(hoveredOver)){
            this.drawings.drawSingleCell(this, hoveredOver)
            this.drawings.highlightCell(this, hoveredOver, this.highlightColor)
          }
          else {
            if(this.hoveredCell && board.selectedCell.possibleMoves(board)?.includes(this.hoveredCell)){
              this.drawings.drawSingleCell(this, this.hoveredCell)
              this.drawings.showPossibleMove(this, this.hoveredCell, this.highlightColor)
            }
          }
          this.hoveredCell = hoveredOver
        }
      }
    }

    async rotationButtonPressed(board: Board){
      const selectedCell = board.selectedCell

      if(selectedCell && this.interactable){
        this.gameService.rotatePiece(this.gameId, selectedCell.coordinates, 90)
        this.interactable = false
        await this.animations.rotatePiece(this, board, selectedCell, 90)
        this.gameService.increaseAnimationEvents()
        this.unselectCellEvent(board)
        board.currentTurn++

        this.eventEmitter.invokeRefresh()
      }
    }

    laserButtonPressed(board: Board){
      console.log("LazorShoot2")
      const laserCell = board.getMyLaser()
      if(laserCell && this.interactable){
        this.interactable = false
        board.currentTurn++
        console.log("Sending request")
        this.gameService.shootLaser(this.gameId).then(_ => {
          console.log("Request received! Invoking refresh")
          this.eventEmitter.invokeRefresh()
        })
      }
      else
        alert("You dont have a laser!")
    }

    private selectCellEvent(selectedCell: Cell, board: Board){
      board.selectCell(selectedCell)
      this.drawings.highlightCell(this, selectedCell, this.highlightColor)
      selectedCell.piece?.getPossibleMoves(board, selectedCell).forEach(c => this.drawings.showPossibleMove(this, c, this.highlightColor))
    }

    private unselectCellEvent(board: Board){
      board.unselectCell()
      this.drawings.drawGame(this, board.cells)
    }

    private makeAMoveEvent(coor: Coordinates, board: Board): Promise<void>{
      return this.animations.movePiece(this, board, board.selectedCell!.coordinates, coor)
    }

    private getMousePos(event: MouseEvent){
        const rect = this.ctx.canvas.getBoundingClientRect();

        return {
          x: Math.floor((event.clientX - rect.left) / this.blockSize),
          y: 8 - Math.floor((event.clientY - rect.top) / this.blockSize)
        }
    }

}

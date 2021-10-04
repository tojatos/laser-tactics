import { Coordinates } from "../../game.models"
import { Board } from "../board"
import { Cell } from "../cell"
import { COLS, ROWS } from "../constants"
import { Animations } from "./animations"
import { Drawings } from "./drawings"

export class Canvas {

    ctx: CanvasRenderingContext2D
    animations: Animations
    drawings: Drawings
    interactable: boolean = true
    block_size: number

    constructor(ctx: CanvasRenderingContext2D, board: Board, size: number) {
        this.block_size = size
        this.ctx = ctx
        this.ctx.canvas.width = COLS * this.block_size
        this.ctx.canvas.height = ROWS * this.block_size
        this.drawings = new Drawings(ctx, this.block_size)
        this.animations = new Animations(this.drawings)
        this.ctx.canvas.addEventListener('click', (e) => this.canvasOnclick(e, board), false)
        this.drawings.initBoard(board)
    }

    changeBlockSize(newSize: number, board: Board){
      this.block_size = newSize
      this.drawings.blockSize = this.block_size
      this.ctx.canvas.width = COLS * this.block_size
      this.ctx.canvas.height = ROWS * this.block_size
      this.drawings.drawGame(board, board.cells)
    }

    private async canvasOnclick(event: MouseEvent, board: Board) {

      if(!this.interactable)
        return

      const coor = this.getMousePos(event)
      const selectedCell = board.getSelectableCellByCoordinates(coor.x, coor.y, "2")

      this.interactable = false

      if(board.selectedCell){
        if(selectedCell){
          await this.makeAMoveEvent(coor, board)
          board.movePiece(board.selectedCell, selectedCell)
        }
        this.unselectCellEvent(board)
      }
      else {
        if(selectedCell)
          this.selectCellEvent(selectedCell, board)
      }

      this.interactable = true

    }

    async rotationButtonPressed(board: Board){
      const selectedCell = board.selectedCell

      if(selectedCell){
        this.interactable = false
        await this.animations.rotatePiece(board, selectedCell, 90)
        this.unselectCellEvent(board)
        this.interactable = true
      }

    }

    private selectCellEvent(selectedCell: Cell, board: Board){
      board.selectCell(selectedCell)
      this.drawings.highlightCell(selectedCell, "yellow")
      selectedCell.piece?.getPossibleMoves(board, selectedCell).forEach(c => this.drawings.showPossibleMove(c, "yellow"))
    }

    private unselectCellEvent(board: Board){
      board.unselectCell()
      this.drawings.drawGame(board, board.cells)
    }

    private makeAMoveEvent(coor: Coordinates, board: Board): Promise<void>{
      return this.animations.movePiece(board, board.selectedCell!.coordinates, coor)
    }

    private getMousePos(event: MouseEvent){
        const rect = this.ctx.canvas.getBoundingClientRect();
        return {
          x: Math.floor((event.clientX - rect.left) / this.block_size),
          y: Math.floor((event.clientY - rect.top) / this.block_size)
        }
    }

}

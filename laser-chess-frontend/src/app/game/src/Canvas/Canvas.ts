import { Coordinates } from "../../game.models"
import { Board } from "../board"
import { Cell } from "../cell"
import { BLOCK_SIZE, COLS, ROWS } from "../constants"
import { Animations } from "./animations"
import { Drawings } from "./drawings"

export class Canvas {

    ctx: CanvasRenderingContext2D
    animations: Animations
    drawings: Drawings
    interactable: boolean = true

    constructor(ctx: CanvasRenderingContext2D, board: Board) {
        this.ctx = ctx
        this.ctx.canvas.width = COLS * BLOCK_SIZE
        this.ctx.canvas.height = ROWS * BLOCK_SIZE
        this.drawings = new Drawings(ctx)
        this.animations = new Animations(this.drawings)
        this.ctx.canvas.addEventListener('click', (e) => this.canvasOnclick(e, board), false)
        this.drawings.initBoard(board)
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

    private selectCellEvent(selectedCell: Cell, board: Board){
      board.selectCell(selectedCell)
      selectedCell.piece?.getPossibleMoves(board, selectedCell).forEach(c => this.drawings.highlightCell(c))
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
          x: Math.floor((event.clientX - rect.left) / BLOCK_SIZE),
          y: Math.floor((event.clientY - rect.top) / BLOCK_SIZE)
        }
    }

}

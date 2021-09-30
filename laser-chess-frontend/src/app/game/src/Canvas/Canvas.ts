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

    constructor(ctx: CanvasRenderingContext2D, board: Board) {
        this.ctx = ctx
        this.ctx.canvas.width = COLS * BLOCK_SIZE
        this.ctx.canvas.height = ROWS * BLOCK_SIZE
        this.drawings = new Drawings(ctx)
        this.animations = new Animations(this.drawings)
        this.ctx.canvas.addEventListener('click', (e) => this.canvasOnclick(e, board), false)
        this.drawings.initBoard(board)
    }

    private canvasOnclick(event: MouseEvent, board: Board) {
        const coor = this.getMousePos(event)
        const selectedCell = board.getSelectableCellByCoordinates(coor.x, coor.y, "1")
        if(board.selectedCell){
          if(selectedCell)
            this.makeAMoveEvent(coor, board)
          else
            this.unselectCellEvent(board)
        }
        else {
          if(selectedCell)
            this.selectCellEvent(selectedCell, board)
        }
    }

    private selectCellEvent(selectedCell: Cell, board: Board){
      board.selectCell(selectedCell)
      selectedCell.piece?.getPossibleMoves(board, selectedCell).forEach(c => this.drawings.highlightCell(c))
    }

    private unselectCellEvent(board: Board){
      board.unselectCell()
      this.drawings.drawGame(board, board.cells)
    }

    private makeAMoveEvent(coor: Coordinates, board: Board){
      this.animations.movePiece(board, board.selectedCell!.coordinates, coor)
    }

    private getMousePos(event: MouseEvent){
        const rect = this.ctx.canvas.getBoundingClientRect();
        return {
          x: Math.floor((event.clientX - rect.left) / BLOCK_SIZE),
          y: Math.floor((event.clientY - rect.top) / BLOCK_SIZE)
        }
    }

}

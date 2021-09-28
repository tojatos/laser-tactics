import { Board } from "../board"
import { BLOCK_SIZE, COLS, ROWS } from "../constants"
import { Animations } from "./animations"
import { Drawings } from "./drawings"

export class Canvas {

    ctx: CanvasRenderingContext2D
    board: Board
    animations: Animations
    drawings: Drawings

    constructor(ctx: CanvasRenderingContext2D, board: Board) {
        this.ctx = ctx
        this.ctx.canvas.width = COLS * BLOCK_SIZE
        this.ctx.canvas.height = ROWS * BLOCK_SIZE
        this.board = board
        this.drawings = new Drawings(ctx)
        this.animations = new Animations(this.drawings)
        this.ctx.canvas.addEventListener('click', (e) => this.canvasOnclick(e, this.board), false)
        this.drawings.initBoard(this.board)
    }

    private canvasOnclick(event: MouseEvent, board: Board) {
        const coor = this.getMousePos(event)
        const selectedCell = board.getSelectableCellByCoordinates(coor.x, coor.y, "1")
        board.selectCell(selectedCell)
        this.drawings.highlightCell(selectedCell)

        this.animations.movePiece(board, {x: 0, y: 0}, {x: 4, y: 4})
    }

    private getMousePos(event: MouseEvent){
        const rect = this.ctx.canvas.getBoundingClientRect();
        return {
          x: Math.floor((event.clientX - rect.left) / BLOCK_SIZE),
          y: Math.floor((event.clientY - rect.top) / BLOCK_SIZE)
        }
    }

}

import { Board } from "../Board"
import { BLOCK_SIZE, COLS, ROWS } from "../constants"
import { Animations } from "./Animations"
import { Drawings } from "./Drawings"

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
        this.drawings.highlightCell(board.getSelectableCellByCoordinates(coor.x, coor.y, "1"))
        this.animations.movePiece(board, {x: 0, y: 0}, {x: 1, y: 1})
    }

    private getMousePos(event: MouseEvent){
        const rect = this.ctx.canvas.getBoundingClientRect();
        return {
          x: Math.floor((event.clientX - rect.left) / BLOCK_SIZE),
          y: Math.floor((event.clientY - rect.top) / BLOCK_SIZE)
        }
    }

}
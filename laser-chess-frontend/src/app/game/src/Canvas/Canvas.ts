import { Board } from "../Board"
import { Cell } from "../Cell"
import { BLOCK_SIZE, COLS, PIECE_SIZE, ROWS } from "../constants"

export class Canvas {

    ctx: CanvasRenderingContext2D
    board: Board

    constructor(ctx: CanvasRenderingContext2D, board: Board) {
        this.ctx = ctx
        this.ctx.canvas.width = COLS * BLOCK_SIZE
        this.ctx.canvas.height = ROWS * BLOCK_SIZE
        this.board = board
        this.ctx.canvas.addEventListener('click', (e) => this.canvasOnclick(e, this.board), false)
    }


    drawGame(board: Board = this.board, cells: Cell[] = this.board.cells){
        this.drawBoard(board)
        cells.forEach(c => this.drawCellWithPiece(c))
    }

    private drawBoard(board: Board){
        board.board_img.onload = () => this.ctx.drawImage(board.board_img, 0, 0)
    }

    private drawCellWithPiece(cell: Cell){
        if(cell.piece){
            cell.piece.piece_img.onload = () => {
                this.ctx.save()
                this.ctx.translate(cell.cellOnBoardCoordinates.x, cell.cellOnBoardCoordinates.y)
                this.ctx.rotate(cell.piece!.rotation_degree / 180 * Math.PI)
                this.ctx.drawImage(cell.piece!.piece_img, cell.pieceDrawingOriginCoordinates.x, cell.pieceDrawingOriginCoordinates.y)
                this.ctx.restore()
            }
        }
    }

    private highlightCell(cell: Cell | undefined){
        console.log(cell)
        if(cell) {
            this.ctx.save()
            this.ctx.globalAlpha = 0.5;
            this.ctx.translate(cell.cellOnBoardCoordinates.x, cell.cellOnBoardCoordinates.y)
            this.ctx.beginPath()
            this.ctx.rect(cell.cellDrawingOriginCoordinates.x, cell.cellDrawingOriginCoordinates.y, BLOCK_SIZE, BLOCK_SIZE)
            this.ctx.fillStyle = "yellow"
            this.ctx.fill()
            this.ctx.restore()
        }
    }

    private canvasOnclick(event: MouseEvent, board: Board) {
        const coor = this.getMousePos(event)
        this.highlightCell(board.getSelectableCellByCoordinates(coor.x, coor.y, "1"))

    }

    private getMousePos(event: MouseEvent){
        const rect = this.ctx.canvas.getBoundingClientRect();
        return {
          x: Math.floor((event.clientX - rect.left) / BLOCK_SIZE),
          y: Math.floor((event.clientY - rect.top) / BLOCK_SIZE)
        }
    }

}
import { Coordinates } from "../../game.models"
import { Board } from "../board"
import { Cell } from "../cell"
import { PIECE_SIZE_SCALE } from "../constants"
import { Piece } from "../piece"

export class Drawings {

  // make some queue for drawing

    ctx: CanvasRenderingContext2D
    drawingQueue: (() => void)[]
    blockSize: number

    constructor(ctx: CanvasRenderingContext2D, blockSize: number){
        this.ctx = ctx
        this.drawingQueue = []
        this.blockSize = blockSize
    }

    initBoard(board: Board){
      board.board_img.onload = () => this.drawBoard(board)
      board.board_img.src = board.board_img_source
      board.cells.forEach(c => this.initPieceDraw(c))
  }

    initPieceDraw(cell?: Cell){
        if(cell?.piece){
            cell.piece.piece_img.onload = () => {
              if(cell.piece)
                this.drawPiece(cell.piece)
            }
            cell.piece.piece_img.src = `assets/${cell.piece.piece_type}.svg`
        }
    }

    drawGame(board: Board, cells: Cell[]){
        this.drawBoard(board)
        cells.forEach(c => { if(c.piece) this.drawPiece(c.piece) })
    }

    drawBoard(board: Board){
        this.ctx.drawImage(board.board_img, 0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    }

    drawPiece(piece: Piece){
        this.ctx.save()
        this.ctx.translate(piece.currentCoordinates.x, piece.currentCoordinates.y)
        this.ctx.rotate(piece.rotation_degree / 180 * Math.PI)
        this.ctx.drawImage(piece.piece_img, this.pieceDrawingOriginCoordinates.x, this.pieceDrawingOriginCoordinates.y, this.blockSize * PIECE_SIZE_SCALE, this.blockSize * PIECE_SIZE_SCALE)
        this.ctx.restore()
    }


    highlightCell(cell: Cell | undefined, color: string){
        if(cell) {
            this.ctx.save()
            this.ctx.globalAlpha = 0.5;
            this.ctx.translate(this.cellOnBoardCoordinates(cell.coordinates.x), this.cellOnBoardCoordinates(cell.coordinates.y))
            this.ctx.beginPath()
            this.ctx.rect(this.cellDrawingOriginCoordinates.x, this.cellDrawingOriginCoordinates.y, this.blockSize, this.blockSize)
            this.ctx.fillStyle = color
            this.ctx.fill()
            this.ctx.restore()
        }
    }

    showPossibleMove(cell: Cell | undefined, color: string){
      if(cell) {
          this.ctx.save()
          this.ctx.globalAlpha = 0.5;
          this.ctx.translate(this.cellOnBoardCoordinates(cell.coordinates.x), this.cellOnBoardCoordinates(cell.coordinates.y))
          this.ctx.beginPath()
          this.ctx.arc(0, 0, this.blockSize / 10, 0, 2 * Math.PI, false);
          this.ctx.fillStyle = color
          this.ctx.fill()
          this.ctx.restore()
      }
    }

    get cellDrawingOriginCoordinates(): Coordinates {
        return {x: - this.blockSize / 2, y: - this.blockSize / 2}
    }

    get pieceDrawingOriginCoordinates(): Coordinates {
        return {x: - this.blockSize * PIECE_SIZE_SCALE / 2, y: - this.blockSize * PIECE_SIZE_SCALE / 2}
    }

    cellOnBoardCoordinates(coor: number) : number {
        return coor * this.blockSize + this.blockSize / 2
    }
}

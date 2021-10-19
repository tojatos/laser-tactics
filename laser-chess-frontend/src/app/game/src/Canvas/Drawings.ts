import { Coordinates } from "../../game.models"
import { Cell } from "../cell"
import { PIECE_SIZE_SCALE, ROWS } from "../constants"
import { Piece } from "../piece"
import { Resources } from "./Resources"

export class Drawings {

    ctx: CanvasRenderingContext2D
    drawingQueue: (() => void)[]
    blockSize: number
    resources: Resources

    constructor(ctx: CanvasRenderingContext2D, blockSize: number, resources: Resources){
        this.ctx = ctx
        this.drawingQueue = []
        this.blockSize = blockSize
        this.resources = resources
    }

    drawGame(cells: Cell[]){
        this.drawBoard(this.resources.boardImage)
        cells.forEach(c => { if(c.piece) this.drawPiece(c.piece) })
    }

    drawBoard(boardImage: HTMLImageElement){
      this.ctx.drawImage(boardImage, 0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    }

    drawPiece(piece: Piece){
        this.ctx.save()
        this.ctx.translate(piece.currentCoordinates.x, piece.currentCoordinates.y)
        this.ctx.rotate(piece.rotation_degree / 180 * Math.PI)
        this.ctx.drawImage(this.resources.getPieceFromMap(piece), this.pieceDrawingOriginCoordinates.x, this.pieceDrawingOriginCoordinates.y, this.blockSize * PIECE_SIZE_SCALE, this.blockSize * PIECE_SIZE_SCALE)
        this.ctx.restore()
    }


    highlightCell(cell: Cell | undefined, color: string){
        if(cell) {
            this.ctx.save()
            this.ctx.globalAlpha = 0.5;
            this.ctx.translate(cell.canvasCoordinates.x, cell.canvasCoordinates.y)
            this.ctx.beginPath()
            this.ctx.rect(this.cellDrawingOriginCoordinates.x, this.cellDrawingOriginCoordinates.y, this.blockSize, this.blockSize)
            this.ctx.fillStyle = color
            this.ctx.fill()
            this.ctx.restore()
            if(cell.piece)
              this.drawPiece(cell.piece)
        }
    }

    drawSingleCell(cell: Cell, boardImage: HTMLImageElement){
      const imgSize = boardImage.width
      const imageCellSize = Math.round(((imgSize / ROWS) + Number.EPSILON) * 100) / 100
      this.ctx.save()
      this.ctx.translate(cell.canvasCoordinates.x, cell.canvasCoordinates.y)
      this.ctx.drawImage(boardImage, cell.coordinates.x * imageCellSize, cell.coordinates.y * imageCellSize,
        imageCellSize, imageCellSize,
        this.cellDrawingOriginCoordinates.x, this.cellDrawingOriginCoordinates.y,
        this.blockSize, this.blockSize)
      this.ctx.restore()
      if(cell.piece)
        this.drawPiece(cell.piece)
    }

    showPossibleMove(cell: Cell | undefined, color: string){
      if(cell) {
          this.ctx.save()
          this.ctx.globalAlpha = 0.5;
          this.ctx.translate(cell.canvasCoordinates.x, cell.canvasCoordinates.y)
          this.ctx.beginPath()
          this.ctx.arc(0, 0, this.blockSize / 10, 0, 2 * Math.PI, false);
          this.ctx.fillStyle = color
          this.ctx.fill()
          this.ctx.restore()
      }
    }

    drawLaserLine(from: Coordinates, to: Coordinates){
      this.ctx.save()
      this.ctx.lineWidth = 5
      this.ctx.beginPath()
      this.ctx.moveTo(from.x, from.y)
      this.ctx.lineTo(to.x, to.y)
      this.ctx.strokeStyle = "red"
      this.ctx.stroke()
    }

    get cellDrawingOriginCoordinates(): Coordinates {
        return {x: - this.blockSize / 2, y: - this.blockSize / 2}
    }

    get pieceDrawingOriginCoordinates(): Coordinates {
        return {x: - this.blockSize * PIECE_SIZE_SCALE / 2, y: - this.blockSize * PIECE_SIZE_SCALE / 2}
    }

}

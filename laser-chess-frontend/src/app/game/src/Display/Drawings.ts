import { Coordinates } from "../../game.models"
import { Cell } from "../cell"
import { PIECE_SIZE_SCALE } from "../constants"
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
        this.clearBoard()
        cells.forEach(c => { if(c.piece) this.drawPiece(c.piece) })
    }

    clearBoard(){
        this.ctx.save()
        this.ctx.translate(0, 0)
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.restore()
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

    drawSingleCell(cell: Cell){
      this.ctx.save()
      this.ctx.translate(cell.canvasCoordinates.x, cell.canvasCoordinates.y)
      this.ctx.clearRect(this.cellDrawingOriginCoordinates.x, this.cellDrawingOriginCoordinates.y, this.blockSize, this.blockSize);
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

    drawLaserButton(){
      const coordinates = {x: this.ctx.canvas.width / 2, y: this.ctx.canvas.height - this.ctx.canvas.height / 5}
      this.drawButton(coordinates, this.resources.laserShotButton)
    }

    drawButton(at: Coordinates, image: HTMLImageElement){
      this.ctx.save()
      this.ctx.globalAlpha = 0.8;
      this.ctx.translate(at.x, at.y)
      const ratio = image.width / image.height
      const height = this.blockSize * 3 / ratio
      const width = this.blockSize * 3 * ratio
      this.ctx.drawImage(image, - width / 2, - height / 2, width, height)
      this.ctx.restore()
    }

    get cellDrawingOriginCoordinates(): Coordinates {
        return {x: - this.blockSize / 2, y: - this.blockSize / 2}
    }

    get pieceDrawingOriginCoordinates(): Coordinates {
        return {x: - this.blockSize * PIECE_SIZE_SCALE / 2, y: - this.blockSize * PIECE_SIZE_SCALE / 2}
    }

}

import { Injectable } from "@angular/core"
import { Coordinates } from "../../game.models"
import { Cell } from "../cell"
import { PIECE_SIZE_SCALE } from "../constants"
import { Piece } from "../piece"
import { Canvas } from "./Canvas/AbstractCanvas"
import { Button } from "./Button"

@Injectable()
export class Drawings {

    highlightColor: string = "yellow"

    drawGame(canvas: Canvas, cells: Cell[]){
        this.clearBoard(canvas)
        cells.forEach(c => { if(c.piece) this.drawPiece(canvas, c.piece) })
    }

    clearBoard(canvas: Canvas){
        canvas.ctx.save()
        canvas.ctx.translate(0, 0)
        canvas.ctx.clearRect(0, 0, canvas.ctx.canvas.width, canvas.ctx.canvas.height);
        canvas.ctx.restore()
    }

    drawPiece(canvas: Canvas, piece: Piece){
      canvas.ctx.save()
      canvas.ctx.translate(piece.currentCoordinates.x, piece.currentCoordinates.y)
      canvas.ctx.rotate(piece.rotation_degree / 180 * Math.PI)
      canvas.ctx.drawImage(canvas.resources.getPieceFromMap(piece), this.pieceDrawingOriginCoordinates(canvas.blockSize).x, this.pieceDrawingOriginCoordinates(canvas.blockSize).y, canvas.blockSize * PIECE_SIZE_SCALE, canvas.blockSize * PIECE_SIZE_SCALE)
      canvas.ctx.restore()
    }


    highlightCell(canvas: Canvas, cell: Cell | undefined, piece: Piece | undefined = undefined, color: string = this.highlightColor){
        if(cell) {
          canvas.ctx.save()
          canvas.ctx.globalAlpha = 0.5;
          canvas.ctx.translate(cell.canvasCoordinates.x, cell.canvasCoordinates.y)
          canvas.ctx.beginPath()
          canvas.ctx.rect(this.cellDrawingOriginCoordinates(canvas.blockSize).x, this.cellDrawingOriginCoordinates(canvas.blockSize).y, canvas.blockSize, canvas.blockSize)
          canvas.ctx.fillStyle = color
          canvas.ctx.fill()
          canvas.ctx.restore()
          const pieceToDraw = piece || cell.piece
            if(pieceToDraw)
              this.drawPiece(canvas, pieceToDraw)
        }
    }

    drawSingleCell(canvas: Canvas, cell: Cell){
      canvas.ctx.save()
      canvas.ctx.translate(cell.canvasCoordinates.x, cell.canvasCoordinates.y)
      canvas.ctx.clearRect(this.cellDrawingOriginCoordinates(canvas.blockSize).x, this.cellDrawingOriginCoordinates(canvas.blockSize).y, canvas.blockSize, canvas.blockSize);
      canvas.ctx.restore()
      if(cell.piece)
        this.drawPiece(canvas, cell.piece)
    }

    showPossibleMove(canvas: Canvas, cell: Cell | undefined, color: string = this.highlightColor){
      if(cell) {
          canvas.ctx.save()
          canvas.ctx.globalAlpha = 0.5;
          canvas.ctx.translate(cell.canvasCoordinates.x, cell.canvasCoordinates.y)
          canvas.ctx.beginPath()
          canvas.ctx.arc(0, 0, canvas.blockSize / 10, 0, 2 * Math.PI, false);
          canvas.ctx.fillStyle = color
          canvas.ctx.fill()
          canvas.ctx.restore()
      }
    }

    drawLaserLine(canvas: Canvas, from: Coordinates, to: Coordinates){
      canvas.ctx.save()
      canvas.ctx.lineWidth = 5
      canvas.ctx.beginPath()
      canvas.ctx.moveTo(from.x, from.y)
      canvas.ctx.lineTo(to.x, to.y)
      canvas.ctx.strokeStyle = "red"
      canvas.ctx.stroke()
    }

    drawButton(canvas: Canvas, button: Button){
      canvas.ctx.save()
      canvas.ctx.globalAlpha = 0.8;
      canvas.ctx.drawImage(button.image, button.originPosition.x, button.originPosition.y, button.width, button.height)
      canvas.ctx.restore()
    }

    cellDrawingOriginCoordinates(blockSize: number): Coordinates {
        return {x: - blockSize / 2, y: - blockSize / 2}
    }

    pieceDrawingOriginCoordinates(blockSize: number): Coordinates {
        return {x: - blockSize * PIECE_SIZE_SCALE / 2, y: - blockSize * PIECE_SIZE_SCALE / 2}
    }

}

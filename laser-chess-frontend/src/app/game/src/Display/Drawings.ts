import { Injectable } from "@angular/core"
import { Coordinates } from "../../game.models"
import { Cell } from "../cell"
import { COLS, PIECE_SIZE_SCALE, ROWS } from "../constants"
import { Piece } from "../piece"
import { Canvas } from "./Canvas/AbstractCanvas"

@Injectable()
export class Drawings {

    highlightColor: string = "yellow"
    laserThickness = 5

    drawGame(canvas: Canvas, cells: Cell[], isReversed: boolean){
        this.clearBoard(canvas)
        cells.forEach(c => { if(c.piece) this.drawPiece(canvas, c.piece, isReversed) })
    }

    clearBoard(canvas: Canvas){
        canvas.ctx.save()
        canvas.ctx.translate(0, 0)
        canvas.ctx.clearRect(0, 0, canvas.ctx.canvas.width, canvas.ctx.canvas.height);
        canvas.ctx.restore()
    }

    drawPiece(canvas: Canvas, piece: Piece, isReverse: boolean){
      canvas.ctx.save()
      const position = isReverse ? this.flipPosition(piece.currentCoordinates, canvas.ctx.canvas.width, canvas.ctx.canvas.height) : piece.currentCoordinates
      const rotation = isReverse ? (piece.rotation_degree + 180) % 360 : piece.rotation_degree
      canvas.ctx.translate(position.x, position.y)
      canvas.ctx.rotate(rotation / 180 * Math.PI)
      canvas.ctx.drawImage(canvas.resources.getPieceFromMap(piece), this.pieceDrawingOriginCoordinates(canvas.blockSize).x, this.pieceDrawingOriginCoordinates(canvas.blockSize).y, canvas.blockSize * PIECE_SIZE_SCALE, canvas.blockSize * PIECE_SIZE_SCALE)
      canvas.ctx.restore()
    }


    highlightCell(canvas: Canvas, cell: Cell | undefined, isReverse: boolean, piece: Piece | undefined = undefined, color: string = this.highlightColor){
        if(cell) {
          canvas.ctx.save()
          canvas.ctx.globalAlpha = 0.5;
          const cellCoor = isReverse ? this.flipPosition(cell.canvasCoordinates, canvas.ctx.canvas.width, canvas.ctx.canvas.height) : cell.canvasCoordinates
          canvas.ctx.translate(cellCoor.x, cellCoor.y)
          canvas.ctx.beginPath()
          canvas.ctx.rect(this.cellDrawingOriginCoordinates(canvas.blockSize).x, this.cellDrawingOriginCoordinates(canvas.blockSize).y, canvas.blockSize, canvas.blockSize)
          canvas.ctx.fillStyle = color
          canvas.ctx.fill()
          canvas.ctx.restore()
          if(piece)
            this.drawPiece(canvas, piece, isReverse)
        }
    }

    drawSingleCell(canvas: Canvas, cell: Cell, isReverse: boolean){
      this.clearSingleCell(canvas, cell, isReverse)
      if(cell.piece)
        this.drawPiece(canvas, cell.piece, isReverse)
    }

    clearSingleCell(canvas: Canvas, cell: Cell, isReverse: boolean){
      canvas.ctx.save()
      const cellCoor = isReverse ? this.flipPosition(cell.canvasCoordinates, canvas.ctx.canvas.width, canvas.ctx.canvas.height) : cell.canvasCoordinates
      canvas.ctx.translate(cellCoor.x, cellCoor.y)
      canvas.ctx.clearRect(this.cellDrawingOriginCoordinates(canvas.blockSize).x, this.cellDrawingOriginCoordinates(canvas.blockSize).y, canvas.blockSize, canvas.blockSize);
      canvas.ctx.restore()
    }

    showPossibleMove(canvas: Canvas, cell: Cell | undefined, isReverse: boolean, color: string = this.highlightColor){
      if(cell) {
          canvas.ctx.save()
          canvas.ctx.globalAlpha = 0.5;
          const cellCoor = isReverse ? this.flipPosition(cell.canvasCoordinates, canvas.ctx.canvas.width, canvas.ctx.canvas.height) : cell.canvasCoordinates
          canvas.ctx.translate(cellCoor.x, cellCoor.y)
          canvas.ctx.beginPath()
          canvas.ctx.arc(0, 0, canvas.blockSize / 10, 0, 2 * Math.PI, false);
          canvas.ctx.fillStyle = color
          canvas.ctx.fill()
          canvas.ctx.restore()
      }
    }

    drawLaserLine(canvas: Canvas, from: Coordinates, to: Coordinates, isReverse: boolean){
      from = isReverse ? this.flipPosition(from, canvas.ctx.canvas.width, canvas.ctx.canvas.height) : from
      to = isReverse ? this.flipPosition(to, canvas.ctx.canvas.width, canvas.ctx.canvas.height) : to
      canvas.ctx.save()
      canvas.ctx.lineWidth = this.laserThickness
      canvas.ctx.beginPath()
      canvas.ctx.moveTo(from.x, from.y)
      canvas.ctx.lineTo(to.x, to.y)
      canvas.ctx.strokeStyle = "red"
      canvas.ctx.stroke()
    }

    drawLaserCorner(canvas: Canvas, at: Coordinates, isReverse: boolean){
      canvas.ctx.save()
      at = isReverse ? this.flipPosition(at, canvas.ctx.canvas.width, canvas.ctx.canvas.height) : at
      canvas.ctx.translate(at.x, at.y)
      canvas.ctx.fillStyle = "red";
      canvas.ctx.fillRect(-this.laserThickness / 2, -this.laserThickness / 2, this.laserThickness, this.laserThickness)
      canvas.ctx.restore()
    }

    cellDrawingOriginCoordinates(blockSize: number): Coordinates {
        return {x: - blockSize / 2, y: - blockSize / 2}
    }

    pieceDrawingOriginCoordinates(blockSize: number): Coordinates {
        return {x: - blockSize * PIECE_SIZE_SCALE / 2, y: - blockSize * PIECE_SIZE_SCALE / 2}
    }

    flipPosition(coor: Coordinates, maxX: number, maxY: number){
      return {x: maxX - coor.x, y: maxY - coor.y }
    }

}

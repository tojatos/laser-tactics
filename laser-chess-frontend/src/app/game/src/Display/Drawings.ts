import { Injectable } from "@angular/core"
import { Coordinates } from "../../game.models"
import { Cell } from "../GameStateData/Cell"
import { PIECE_SIZE_SCALE } from "../Utils/Constants"
import { Piece } from "../GameStateData/Piece"
import { Canvas } from "./Canvas/Canvas"

@Injectable()
export class Drawings {

    laserThickness = 5

    drawGame(canvas: Canvas, cells: Cell[], isReversed: boolean): void{
        this.clearBoard(canvas)
        cells.forEach(c => { if(c.piece) this.drawPiece(canvas, c.piece, isReversed) })
    }

    clearBoard(canvas: Canvas): void{
      if(canvas.ctx){
        canvas.ctx.save()
        canvas.ctx.translate(0, 0)
        canvas.ctx.clearRect(0, 0, canvas.ctx.canvas.width, canvas.ctx.canvas.height);
        canvas.ctx.restore()
      }
    }

    drawPiece(canvas: Canvas, piece: Piece, isReverse: boolean): void{
      if(canvas.ctx){
        canvas.ctx.save()
        const position = isReverse ? this.flipPosition(piece.currentCoordinates, canvas.ctx.canvas.width, canvas.ctx.canvas.height) : piece.currentCoordinates
        const rotation = isReverse ? (piece.rotation_degree + 180) % 360 : piece.rotation_degree
        canvas.ctx.translate(position.x, position.y)
        canvas.ctx.rotate(rotation / 180 * Math.PI)
        const pieceImage = canvas.resources.getPieceFromMap(piece)
        if(pieceImage)
          canvas.ctx.drawImage(pieceImage, this.pieceDrawingOriginCoordinates(canvas.blockSize).x, this.pieceDrawingOriginCoordinates(canvas.blockSize).y, canvas.blockSize * PIECE_SIZE_SCALE, canvas.blockSize * PIECE_SIZE_SCALE)
        canvas.ctx.restore()
      }
    }


    highlightCell(canvas: Canvas, cell: Cell | undefined, isReverse: boolean, piece: Piece | undefined = undefined, color: string): void{
        if(cell && canvas.ctx) {
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

    drawSingleCell(canvas: Canvas, cell: Cell, isReverse: boolean): void{
      this.clearSingleCell(canvas, cell, isReverse)
      if(cell.piece)
        this.drawPiece(canvas, cell.piece, isReverse)
    }

    clearSingleCell(canvas: Canvas, cell: Cell, isReverse: boolean): void{
      if(canvas.ctx){
        canvas.ctx.save()
        const cellCoor = isReverse ? this.flipPosition(cell.canvasCoordinates, canvas.ctx.canvas.width, canvas.ctx.canvas.height) : cell.canvasCoordinates
        canvas.ctx.translate(cellCoor.x, cellCoor.y)
        canvas.ctx.clearRect(this.cellDrawingOriginCoordinates(canvas.blockSize).x, this.cellDrawingOriginCoordinates(canvas.blockSize).y, canvas.blockSize, canvas.blockSize);
        canvas.ctx.restore()
      }
    }

    showPossibleMove(canvas: Canvas, cell: Cell | undefined, isReverse: boolean, color: string): void{
      if(cell && canvas.ctx) {
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

    drawLaserLine(canvas: Canvas, from: Coordinates, to: Coordinates, isReverse: boolean): void{
      if(canvas.ctx){
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
    }

    drawLaserCorner(canvas: Canvas, at: Coordinates, isReverse: boolean): void{
      if(canvas.ctx){
        canvas.ctx.save()
        at = isReverse ? this.flipPosition(at, canvas.ctx.canvas.width, canvas.ctx.canvas.height) : at
        canvas.ctx.translate(at.x, at.y)
        canvas.ctx.fillStyle = "red";
        canvas.ctx.fillRect(-this.laserThickness / 2, -this.laserThickness / 2, this.laserThickness, this.laserThickness)
        canvas.ctx.restore()
      }
    }

    getPieceIndividualPixels(canvas: Canvas, cell: Cell, size: number, isReverse: boolean){
      if(canvas.ctx){
        type Pixel = {
          originCoordinates: Coordinates,
          image: ImageData
        }

        const cellCoordinates = isReverse ? this.flipPosition(cell.canvasCoordinates, canvas.ctx.canvas.width, canvas.ctx.canvas.height) : cell.canvasCoordinates

        const pixels: Pixel[][] = []

        for (let i = 0; i < canvas.blockSize * PIECE_SIZE_SCALE; i+=size){
          pixels.push([])
          for (let j = 0; j < canvas.blockSize * PIECE_SIZE_SCALE; j+=size){
            const x = cellCoordinates.x + this.pieceDrawingOriginCoordinates(canvas.blockSize).x + j
            const y = cellCoordinates.y + this.pieceDrawingOriginCoordinates(canvas.blockSize).y + i
            pixels[i/size].push({
              originCoordinates: {
                  x: Math.round(x),
                  y: Math.round(y)
                },
              image: canvas.ctx.getImageData(x, y, size, size)
            })
          }
        }
        return pixels
    }
    return undefined
    }

    cellDrawingOriginCoordinates(blockSize: number): Coordinates {
        return {x: - blockSize / 2, y: - blockSize / 2}
    }

    pieceDrawingOriginCoordinates(blockSize: number): Coordinates {
        return {x: - blockSize * PIECE_SIZE_SCALE / 2, y: - blockSize * PIECE_SIZE_SCALE / 2}
    }

    flipPosition(coor: Coordinates, maxX: number, maxY: number): Coordinates{
      return {x: maxX - coor.x, y: maxY - coor.y }
    }

}

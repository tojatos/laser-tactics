import { Coordinates } from "../../game.models";
import { Board } from "../board";
import { Cell } from "../cell";
import { Piece } from "../piece";
import { Drawings } from "./Drawings";

export class Animations {

    drawings: Drawings

    constructor(drawings: Drawings){
        this.drawings = drawings
    }

    async movePiece(board: Board, originCooridantes: Coordinates, destinationCoordinates: Coordinates): Promise<void>{

        const origin = board.getCellByCoordinates(originCooridantes.x, originCooridantes.y)
        const destination = board.getCellByCoordinates(destinationCoordinates.x, destinationCoordinates.y)

        const piece = origin?.auxiliaryPiece || origin?.piece

        if(!origin || !destination || !piece){
            console.error("Cannot move a piece. Wrong cell selected or piece is not in selected origin")
            return
        }

        const speed = 20
        const redrawDistance = 5

        const fun = this.designateLinearFunction(
            origin.canvasCoordinates.x,
            origin.canvasCoordinates.y,
            destination.canvasCoordinates.x,
            destination.canvasCoordinates.y
            )

        const validCellsArray = origin.auxiliaryPiece ? board.cells : this.cellsExcludingPiece(board, origin)

        return new Promise<void>((resolve) => {
          const interval = setInterval(() => {
              this.drawings.drawGame(validCellsArray)
              this.changePosition(piece, originCooridantes, destinationCoordinates, redrawDistance, fun)
              this.drawings.drawPiece(piece)
              if(this.inVicinity(destination.canvasCoordinates, piece.currentCoordinates.x, piece.currentCoordinates.y, redrawDistance)){
                piece.currentCoordinates = destination.canvasCoordinates
                clearInterval(interval)
                resolve()
              }
          }, 100 / speed )
        })

    }

    async rotatePiece(board: Board, atCell: Cell | undefined, byDegrees: number): Promise<void>{
      const piece = atCell?.piece

      if(!piece || !atCell)
        return

      const speed = 20
      const degreesPerFrame = 2

      const validCellsArray = this.cellsExcludingPiece(board, atCell)
      const desiredPiecePosition = piece.rotation_degree + byDegrees

      return new Promise<void>((resolve) => {
        const interval = setInterval(() => {
            this.drawings.drawGame(validCellsArray)
            piece.rotation_degree += degreesPerFrame
            this.drawings.drawPiece(piece)
            if(this.inRotationVicinity(piece.rotation_degree, desiredPiecePosition, degreesPerFrame)){
              piece.rotation_degree = desiredPiecePosition % 360
              clearInterval(interval)
              resolve()
            }
        }, 100 / speed )
      })

    }

    async laserAnimation(board: Board, from: Coordinates, to: Coordinates): Promise<void> {
      const fromCell = board.getCellByCoordinates(from.x, from.y)
      const toCell = board.getCellByCoordinates(to.x, to.y)

      const speed = 20
      const laserIncrementPerFrame = 10
      let laserIncrement = laserIncrementPerFrame
      if(fromCell && toCell){

        const xModifier = this.getTranslationValue(fromCell.canvasCoordinates.x, toCell.canvasCoordinates.x)
        const yModifier = this.getTranslationValue(fromCell.canvasCoordinates.y, toCell.canvasCoordinates.y)

        return new Promise<void>((resolve) => {
          const interval = setInterval(() => {

            const currentCoordinates = {
              x: fromCell.canvasCoordinates.x - laserIncrement * xModifier,
              y: fromCell.canvasCoordinates.y - laserIncrement * yModifier
            }

            this.drawings.drawLaserLine(fromCell.canvasCoordinates, currentCoordinates)

            laserIncrement += laserIncrementPerFrame
            if(this.inVicinity(toCell.canvasCoordinates, currentCoordinates.x, currentCoordinates.y, laserIncrementPerFrame)){
              this.drawings.drawLaserLine(fromCell.canvasCoordinates, toCell.canvasCoordinates)
              // draw a small square at the middle of field
              clearInterval(interval)
              resolve()
            }
          }, 100 / speed )
        })
      }

    }

    private cellsExcludingPiece(board: Board, cell: Cell){
        return board.cells.filter(c => c.piece != board.getCellByCoordinates(cell.coordinates.x, cell.coordinates.y)?.piece)
    }

    private inVicinity(destination: Coordinates, currentPosX: number, currentPosY: number, vicinity: number){
        return Math.abs(destination.x - currentPosX) < vicinity * 3 && Math.abs(destination.y - currentPosY) < vicinity * 3
    }

    private inRotationVicinity(currentRotation: number, desiredRotation: number, deegresPerFrame: number){
      return Math.abs(currentRotation - desiredRotation) <= deegresPerFrame * 2
    }

    private designateLinearFunction(x1: number, y1: number, x2: number, y2: number){
        return (x: number) => (y1 - y2) * x / (x1 - x2) + y1 - (y1 - y2) * x1 / (x1 - x2)
    }

    private changePosition(piece: Piece, originCooridantes: Coordinates, destinationCoordinates: Coordinates, redrawDistance: number, fun: (x: number) => number){
        const translationValueX = this.getTranslationValue(originCooridantes.x, destinationCoordinates.x)
        const translationValueY = this.getTranslationValue(originCooridantes.y, destinationCoordinates.y)

        piece.currentCoordinates.x = piece.currentCoordinates.x - redrawDistance * translationValueX

        piece.currentCoordinates.y = translationValueX == 0
        ? piece.currentCoordinates.y + redrawDistance * translationValueY
        : fun(piece.currentCoordinates.x)
    }

    private getTranslationValue(n1: number, n2: number){
      return n1 > n2 ? 1 : n1 < n2 ? -1 : 0
    }

    private getDistanceBetweenPoints(x1: number, y1: number, x2: number, y2: number){
        return Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2))
    }

}
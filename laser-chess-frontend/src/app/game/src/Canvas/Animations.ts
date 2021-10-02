import { Coordinates } from "../../game.models";
import { Board } from "../board";
import { Cell } from "../cell";
import { Piece } from "../piece";
import { Drawings } from "./drawings";

export class Animations {

    drawings: Drawings

    constructor(drawings: Drawings){
        this.drawings = drawings
    }

    async movePiece(board: Board, originCooridantes: Coordinates, destinationCoordinates: Coordinates): Promise<void>{

        const origin = board.getCellByCoordinates(originCooridantes.x, originCooridantes.y)
        const destination = board.getCellByCoordinates(destinationCoordinates.x, destinationCoordinates.y)

        const piece = origin?.piece

        if(piece == null || origin == null || destination == null)
            return

        const speed = 20
        const redrawDistance = 5

        const fun = this.designateLinearFunction(
            origin.canvasCoordinates.x,
            origin.canvasCoordinates.y,
            destination.canvasCoordinates.x,
            destination.canvasCoordinates.y
            )

        const validCellsArray = this.cellsExcludingPiece(board, origin)

        return new Promise<void>((resolve) => {
          const interval = setInterval(() => {
              this.drawings.drawGame(board, validCellsArray)
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

    private cellsExcludingPiece(board: Board, cell: Cell){
        return board.cells.filter(c => c.piece != board.getCellByCoordinates(cell.coordinates.x, cell.coordinates.y)?.piece)
    }

    private inVicinity(destination: Coordinates, currentPosX: number, currentPosY: number, vicinity: number){
        return Math.abs(destination.x - currentPosX) < vicinity && Math.abs(destination.y - currentPosY) < vicinity
    }

    private designateLinearFunction(x1: number, y1: number, x2: number, y2: number){
        return (x: number) => (y1 - y2) * x / (x1 - x2) + y1 - (y1 - y2) * x1 / (x1 - x2)
    }

    private changePosition(piece: Piece, originCooridantes: Coordinates, destinationCoordinates: Coordinates, redrawDistance: number, fun: (x: number) => number){
        const translationValueX = this.getTranslationValue(originCooridantes.x, destinationCoordinates.x)
        const translationValueY = this.getTranslationValue(originCooridantes.y, destinationCoordinates.y)

        piece.currentCoordinates.x = piece.currentCoordinates.x + redrawDistance * translationValueX

        piece.currentCoordinates.y = translationValueX == 0
        ? piece.currentCoordinates.y + redrawDistance * translationValueY
        : fun(piece.currentCoordinates.x)
    }

    private getTranslationValue(n1: number, n2: number){
      return n1 > n2 ? -1 : n1 < n2 ? 1 : 0
    }

    private getDistanceBetweenPoints(x1: number, y1: number, x2: number, y2: number){
        return Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2))
    }

}

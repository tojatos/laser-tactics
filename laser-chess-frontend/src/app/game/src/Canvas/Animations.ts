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

    movePiece(board: Board, originCooridantes: Coordinates, destinationCoordinates: Coordinates){

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

        const reversedFun = this.designateReversedLinearFunction(
            origin.canvasCoordinates.x,
            origin.canvasCoordinates.y,
            destination.canvasCoordinates.x,
            destination.canvasCoordinates.y
            )

        const validCellsArray = this.cellsExcludingPiece(board, origin)

        const interval = setInterval(() => {
            if(this.inVicinity(destination.canvasCoordinates, piece.currentCoordinates.x, piece.currentCoordinates.y, redrawDistance))
                clearInterval(interval)
            this.drawings.drawGame(board, validCellsArray)
            this.changePosition(piece, originCooridantes, destinationCoordinates, redrawDistance, fun, reversedFun)
            this.drawings.drawPiece(piece)
        }, 100 / speed )


        origin.piece = null
        destination.piece = piece
    }

    private cellsExcludingPiece(board: Board, cell: Cell){
        return board.cells.filter(c => c.piece != board.getCellByCoordinates(cell.coordinates.x, cell.coordinates.y)?.piece)
    }

    private inVicinity(destination: Coordinates, currentPosX: number, currentPosY: number, vicinity: number){
        return Math.abs(destination.x - currentPosX) <= vicinity && Math.abs(destination.y - currentPosY) <= vicinity
    }

    private designateLinearFunction(x1: number, y1: number, x2: number, y2: number){
        return (x: number) => (y1 - y2) * x / (x1 - x2) + (y1 - (y1 - y2) * x1 / (x1 - x2))
    }

    private designateReversedLinearFunction(x1: number, y1: number, x2: number, y2: number){
        return (y: number) => (y - (y1 - (y1 - y2) * x1 / (x1 - x2))) * (x1 - x2) / (y1 - y2)
    }

    private changePosition(piece: Piece, originCooridantes: Coordinates, destinationCoordinates: Coordinates, redrawDistance: number, fun: (x: number) => number, revFun: (y: number) => number){
        const translationValue = originCooridantes.x > destinationCoordinates.x ? -1 : 1

        piece.currentCoordinates.x = destinationCoordinates.x == originCooridantes.x
        ? revFun(piece.currentCoordinates.y)
        : piece.currentCoordinates.x + redrawDistance * translationValue

        piece.currentCoordinates.y = destinationCoordinates.x == originCooridantes.x
        ? piece.currentCoordinates.y + redrawDistance * translationValue
        : fun(piece.currentCoordinates.x)

        if(this.inVicinity(destinationCoordinates, piece.currentCoordinates.x, piece.currentCoordinates.y, redrawDistance))
          piece.currentCoordinates = destinationCoordinates
    }

    private getDistanceBetweenPoints(x1: number, y1: number, x2: number, y2: number){
        return Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2))
    }

}

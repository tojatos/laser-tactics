import { Injectable } from "@angular/core";
import { cloneDeep } from "lodash";
import { Coordinates } from "../../game.models";
import { Board } from "../board";
import { Cell } from "../cell";
import { PieceType } from "../enums";
import { Piece } from "../piece";
import { Canvas } from "./Canvas/AbstractCanvas";
import { Drawings } from "./Drawings";

@Injectable()
export class Animations {

    constructor(private drawings: Drawings){}

    async movePiece(canvas: Canvas, board: Board, originCoordinates: Coordinates, destinationCoordinates: Coordinates, showAnimations: boolean): Promise<void>{

        const origin = board.getCellByCoordinates(originCoordinates.x, originCoordinates.y)
        const destination = board.getCellByCoordinates(destinationCoordinates.x, destinationCoordinates.y)

        const pieceRef = origin?.auxiliaryPiece || origin?.piece
        const piece = cloneDeep(pieceRef)

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

        let validCellsArray = origin.auxiliaryPiece ? board.cells : this.cellsExcludingPiece(board, board.cells, origin)
        if(destination.piece?.piece_type != PieceType.HYPER_CUBE && destination.piece?.piece_type != PieceType.HYPER_SQUARE)
          validCellsArray = this.cellsExcludingPiece(board, validCellsArray, destination)

        const intervalAction = () => {
          this.drawings.drawGame(canvas, validCellsArray)
          this.changePosition(piece, originCoordinates, destinationCoordinates, redrawDistance, fun)
          this.drawings.drawPiece(canvas, piece)
        }

        const lastAction = () => {
          this.drawings.drawGame(canvas, validCellsArray)
          piece.currentCoordinates = destination.canvasCoordinates
          if(destination.piece?.piece_type != PieceType.HYPER_CUBE && destination.piece?.piece_type != PieceType.HYPER_SQUARE)
            this.drawings.drawPiece(canvas, piece)
        }

        if(!showAnimations)
        return new Promise<void>((resolve) => {
          lastAction()
          resolve()
        })

        return new Promise<void>((resolve) => {
          const interval = setInterval(() => {
            intervalAction()
            if(this.inVicinity(destination.canvasCoordinates, piece.currentCoordinates.x, piece.currentCoordinates.y, redrawDistance)){
              lastAction()
              clearInterval(interval)
              resolve()
            }
          }, 100 / speed )
        })

    }

    async rotatePiece(canvas: Canvas, board: Board, atCell: Cell | undefined, byDegrees: number, showAnimations: boolean, initialRotationDifference: number = 0): Promise<void>{
      const piece = cloneDeep(atCell?.piece)

      if(!piece || !atCell)
        return

      piece.rotation_degree += initialRotationDifference
      const speed = 20
      const degreesPerFrame = byDegrees > 0 ? 2 : -2

      const validCellsArray = this.cellsExcludingPiece(board, board.cells, atCell)
      const desiredPiecePosition = piece.rotation_degree + byDegrees

      const intervalAction = () => {
        this.drawings.drawGame(canvas, validCellsArray)
        piece.rotation_degree += degreesPerFrame
        this.drawings.highlightCell(canvas, atCell, piece)
        this.drawings.drawPiece(canvas, piece)
      }

      const lastAction = () => {
        if(piece.rotation_degree < 0)
          piece.rotation_degree = 360 + piece.rotation_degree
        piece.rotation_degree = desiredPiecePosition % 360
        this.drawings.drawGame(canvas, validCellsArray)
        this.drawings.highlightCell(canvas, atCell, piece)
      }

      if(!showAnimations)
        return new Promise<void>((resolve) => {
          lastAction()
          resolve()
        })

      return new Promise<void>((resolve) => {
        const interval = setInterval(() => {
            intervalAction()
            if(this.inRotationVicinity(piece.rotation_degree, desiredPiecePosition, degreesPerFrame)){
              lastAction()
              clearInterval(interval)
              resolve()
            }
        }, 100 / speed )
      })

    }

    async laserAnimation(canvas: Canvas, board: Board, from: Coordinates, to: Coordinates, showAnimations: boolean): Promise<void> {
      const fromCell = board.getCellByCoordinates(from.x, from.y)
      let toCell = board.getCellByCoordinates(Math.min(8, Math.max(0, to.x)), Math.min(8, Math.max(0, to.y)))?.canvasCoordinates

      if(to.x > 8)
        toCell = {x: toCell!.x + board.blockSize!, y: toCell!.y}
      else if(to.x < 0)
        toCell = {x: toCell!.x - board.blockSize!, y: toCell!.y}
      if(to.y > 8)
        toCell = {x: toCell!.x, y: toCell!.y + board.blockSize!}
      else if(to.y < 0)
        toCell = {x: toCell!.x, y: toCell!.y - board.blockSize!}

      const speed = 20
      const laserIncrementPerFrame = 10
      let laserIncrement = laserIncrementPerFrame
      if(fromCell && toCell){

        const xModifier = this.getTranslationValue(fromCell.canvasCoordinates.x, toCell.x)
        const yModifier = this.getTranslationValue(fromCell.canvasCoordinates.y, toCell.y)

        const lastAction = () => {
          this.drawings.drawLaserLine(canvas, fromCell.canvasCoordinates, toCell!)
          // draw a small square at the middle of field
        }

        if(!showAnimations)
          return new Promise<void>((resolve) => { lastAction(); resolve() })

        return new Promise<void>((resolve) => {
          const interval = setInterval(() => {

            const currentCoordinates = {
              x: fromCell.canvasCoordinates.x - laserIncrement * xModifier,
              y: fromCell.canvasCoordinates.y - laserIncrement * yModifier
            }

            this.drawings.drawLaserLine(canvas, fromCell.canvasCoordinates, currentCoordinates)
            this.drawings.drawPiece(canvas, board.getLaserCell()!.piece!)

            laserIncrement += laserIncrementPerFrame
            if(this.inVicinity(toCell!, currentCoordinates.x, currentCoordinates.y, laserIncrementPerFrame)){
              lastAction()
              clearInterval(interval)
              resolve()
            }
          }, 100 / speed )
        })
      }

    }

    private cellsExcludingPiece(board: Board, cells: Cell[], cell: Cell){
        return cells.filter(c => c.piece != board.getCellByCoordinates(cell.coordinates.x, cell.coordinates.y)?.piece)
    }

    private inVicinity(destination: Coordinates, currentPosX: number, currentPosY: number, vicinity: number){
        return Math.abs(destination.x - currentPosX) < vicinity * 3 && Math.abs(destination.y - currentPosY) < vicinity * 3
    }

    private inRotationVicinity(currentRotation: number, desiredRotation: number, deegresPerFrame: number){

      if(currentRotation < 0)
        currentRotation = 360 + currentRotation

      if(desiredRotation < 0)
        desiredRotation = 360 + desiredRotation

      return Math.abs(currentRotation - desiredRotation) <= Math.abs(deegresPerFrame) * 2
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

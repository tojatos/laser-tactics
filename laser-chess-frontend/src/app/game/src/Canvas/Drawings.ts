import { Coordinates } from "../../game.models"
import { Board } from "../Board"
import { Cell } from "../Cell"
import { BLOCK_SIZE, PIECE_SIZE } from "../constants"
import { Piece } from "../Piece"

export class Drawings {

    ctx: CanvasRenderingContext2D
    drawingQueue: (() => void)[]

    constructor(ctx: CanvasRenderingContext2D){
        this.ctx = ctx
        this.drawingQueue = []
    }

    draw(){
        this.ctx.save()
        this.ctx.restore()
    }


    initBoard(board: Board){
        board.board_img.onload = () => this.drawBoard(board)
        board.cells.forEach(c => this.initDrawCellWithPiece(c))
    }

    initDrawCellWithPiece(cell?: Cell){
        if(cell?.piece){
            cell.piece.piece_img.onload = () => {
                this.drawCellWithPiece(cell)
            }
        }
    }

    drawCellWithPiece(cell?: Cell){
        if(cell?.piece){
            this.ctx.save()
            this.ctx.translate(this.cellOnBoardCoordinates(cell.coordinates.x), this.cellOnBoardCoordinates(cell.coordinates.y))
            this.ctx.rotate(cell.piece!.rotation_degree / 180 * Math.PI)
            this.ctx.drawImage(cell.piece!.piece_img, this.pieceDrawingOriginCoordinates.x, this.pieceDrawingOriginCoordinates.y)
            this.ctx.restore()
        }
    }

    drawGame(board: Board, cells: Cell[]){
        this.drawBoard(board)
        cells.forEach(c => this.drawCellWithPiece(c))
    }

    drawBoard(board: Board){
        this.ctx.drawImage(board.board_img, 0, 0)
    }

    drawPiece(piece: Piece){
        this.ctx.save()
        this.ctx.translate(piece.currentCoordinates.x, piece.currentCoordinates.x)
        this.ctx.drawImage(piece.piece_img, this.pieceDrawingOriginCoordinates.x, this.pieceDrawingOriginCoordinates.y)
        this.ctx.restore()
    }


    highlightCell(cell: Cell | undefined){
        if(cell) {
            this.ctx.save()
            this.ctx.globalAlpha = 0.5;
            this.ctx.translate(this.cellOnBoardCoordinates(cell.coordinates.x), this.cellOnBoardCoordinates(cell.coordinates.y))
            this.ctx.beginPath()
            this.ctx.rect(this.cellDrawingOriginCoordinates.x, this.cellDrawingOriginCoordinates.y, BLOCK_SIZE, BLOCK_SIZE)
            this.ctx.fillStyle = "yellow"
            this.ctx.fill()
            this.ctx.restore()
        }
    }


    get cellDrawingOriginCoordinates(): Coordinates {
        return {x: - BLOCK_SIZE / 2, y: - BLOCK_SIZE / 2}
    }

    get pieceDrawingOriginCoordinates(): Coordinates {
        return {x: - PIECE_SIZE / 2, y: - PIECE_SIZE / 2}
    }

    cellOnBoardCoordinates(coor: number) : number {
        return coor * BLOCK_SIZE + BLOCK_SIZE / 2
    }
}
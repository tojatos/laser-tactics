import { Coordinates, PieceInterface } from "../game.models"
import { Board } from "./Board"
import { Cell } from "./Cell"
import { PIECE_SIZE } from "./constants"
import { PieceType } from "./PieceType"

export class Piece implements PieceInterface {
  piece_type: string
  piece_owner: string
  rotation_degree: number
  piece_img = new Image()

  constructor(owner: string, pieceType: string, rotation_degree: number, mirror_perspective: boolean = false){
    this.piece_owner = owner
    this.rotation_degree = rotation_degree
    if(mirror_perspective) this.rotation_degree + 180
    this.piece_type = (<any>PieceType)[pieceType] || "unknown"
  }

  draw(ctx: CanvasRenderingContext2D, coordinates: Coordinates){
    this.piece_img.src = `assets/${this.piece_type}.png`
    this.piece_img.onload = () => {
      ctx.save()
      ctx.translate(coordinates.x, coordinates.y)
      ctx.rotate(this.rotation_degree / 180 * Math.PI)
      ctx.drawImage(this.piece_img, -PIECE_SIZE / 2, -PIECE_SIZE / 2)
      ctx.restore()
    }
  }

  getPossibleMoves(board: Board, cell: Cell): Array<Cell> {
    return [
      board.getCellByCoordinates(cell.coordinates.x + 1, cell.coordinates.y),
      board.getCellByCoordinates(cell.coordinates.x - 1, cell.coordinates.y),
      board.getCellByCoordinates(cell.coordinates.x, cell.coordinates.y + 1),
      board.getCellByCoordinates(cell.coordinates.x, cell.coordinates.y - 1)
    ].filter(c => c != undefined && c.piece == null).map(c => c!)
  }

}

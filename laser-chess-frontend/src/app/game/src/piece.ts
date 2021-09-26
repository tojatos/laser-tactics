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
  move_made = false
  currentCoordinates: Coordinates

  constructor(owner: string, pieceType: string, rotation_degree: number, coordinates: Coordinates, mirror_perspective: boolean = false){
    this.piece_owner = owner
    this.rotation_degree = rotation_degree
    if(mirror_perspective) this.rotation_degree + 180
    this.piece_type = (<any>PieceType)[pieceType] || "unknown"
    this.piece_img.src = `assets/${this.piece_type}.png`
    this.currentCoordinates = coordinates
  }

  getPossibleMoves(board: Board, cell: Cell): Array<Cell> {
    return [
      board.getCellByCoordinates(cell.coordinates.x + 1, cell.coordinates.y),
      board.getCellByCoordinates(cell.coordinates.x - 1, cell.coordinates.y),
      board.getCellByCoordinates(cell.coordinates.x, cell.coordinates.y + 1),
      board.getCellByCoordinates(cell.coordinates.x, cell.coordinates.y - 1)
    ].filter(c => this.cellFilterFunction(this.piece_type)(c)).map(c => c!)
  }


  private cellFilterFunction(type: string) {
    if(type == PieceType.BLOCK) return (c: Cell | undefined) => c != undefined
    else if (type == PieceType.HYPERCUBE || type == PieceType.KING) 
      return (c: Cell | undefined) => c != undefined && (this.move_made && c.piece == null)
    return (c: Cell | undefined) => c != undefined && c.piece == null
  }

}

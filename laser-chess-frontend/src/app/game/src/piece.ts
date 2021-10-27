import { Coordinates, PieceInterface } from "../game.models"
import { Board } from "./board"
import { Cell } from "./cell"
import { PieceType } from "./enums"

export class Piece implements PieceInterface {
  piece_type: PieceType
  piece_owner: string
  rotation_degree: number
  special_move_made = false
  currentCoordinates: Coordinates

  constructor(owner: string, pieceType: string, rotation_degree: number, coordinates: Coordinates, mirror_perspective: boolean = false){
    this.piece_owner = owner
    this.rotation_degree = rotation_degree
    if(mirror_perspective) this.rotation_degree + 180
    this.piece_type = pieceType in PieceType ? (<any>PieceType)[pieceType] : PieceType.UNKNOWN
    this.currentCoordinates = coordinates
  }

  getPossibleMoves(board: Board, cell: Cell): Array<Cell> {
    return [
      board.getCellByCoordinates(cell.coordinates.x + 1, cell.coordinates.y),
      board.getCellByCoordinates(cell.coordinates.x - 1, cell.coordinates.y),
      board.getCellByCoordinates(cell.coordinates.x, cell.coordinates.y + 1),
      board.getCellByCoordinates(cell.coordinates.x, cell.coordinates.y - 1)
    ].filter(c => (this.cellFilterFunction(this.piece_type)(c) || c?.piece?.piece_type == PieceType.HYPER_SQUARE) && this.piece_type != PieceType.LASER).map(c => c!)
  }


  private cellFilterFunction(type: string) {
    if(type == PieceType.BLOCK)
      return (c: Cell | undefined) => c != undefined && c.piece?.piece_owner != this.piece_owner
    else if (type == PieceType.HYPER_CUBE)
      return (c: Cell | undefined) => c != undefined && (!this.special_move_made || c.piece == null)
    else if (type == PieceType.KING)
      return (c: Cell | undefined) => c != undefined && ((!this.special_move_made && c.piece?.piece_owner != this.piece_owner) || c.piece == null)
    return (c: Cell | undefined) => c != undefined && c.piece == null
  }

  serialize(){
    return {
      piece_type: this.piece_type,
      piece_owner: this.piece_owner,
      rotation_degree: this.rotation_degree
    }
  }

}
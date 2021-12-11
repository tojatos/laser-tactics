import { Coordinates, CellInterface, PieceInterface } from "../../game.models";
import { Board } from "./Board";
import { ROWS } from "../Utils/Constants";
import { PieceType } from "../Utils/Enums";
import { Piece } from "./Piece";

export class Cell implements CellInterface {
  coordinates!: Coordinates
  canvasCoordinates!: Coordinates
  piece!: Piece | null
  auxiliaryPiece: Piece | null = null

  constructor(coordinates: Coordinates, piece: PieceInterface | null, auxiliaryPiece: PieceInterface | null, blockSize: number){
    this.init(coordinates, piece, auxiliaryPiece, blockSize)
  }

  init(coordinates: Coordinates, piece: PieceInterface | null, auxiliaryPiece: PieceInterface | null, blockSize: number): void{
    this.coordinates = coordinates
    this.canvasCoordinates = this.canvasCoordinatesSetter(blockSize)
    this.piece = piece && new Piece(piece.piece_owner, piece.piece_type, piece.rotation_degree, this.cloneCoordinates(this.canvasCoordinates))
    this.auxiliaryPiece = auxiliaryPiece && new Piece(auxiliaryPiece.piece_owner, auxiliaryPiece.piece_type, auxiliaryPiece.rotation_degree, this.cloneCoordinates(this.canvasCoordinates))
  }

  acceptNewPiece(piece: Piece): void{
    piece.currentCoordinates = this.cloneCoordinates(this.canvasCoordinates)
    if(this.piece?.piece_type == PieceType.HYPER_SQUARE)
      this.auxiliaryPiece = piece
    else if (piece.piece_type == PieceType.HYPER_CUBE && this.piece != null){
      this.auxiliaryPiece = this.piece
      this.piece = piece

    }
    else
      this.piece = piece
  }

  changeCanvasCoordinates(size: number): void{
    this.canvasCoordinates = this.canvasCoordinatesSetter(size)
    if(this.piece)
      this.piece.currentCoordinates = this.cloneCoordinates(this.canvasCoordinates)
  }

  possibleMoves(board: Board): (Cell | undefined)[] | undefined{
    return this.piece?.getPossibleMoves(board, this)
  }

  private canvasCoordinatesSetter(size: number){
    return {x: this.coordinates.x.valueOf() * size + size / 2, y: size * (ROWS - 1) - this.coordinates.y.valueOf() * size + size / 2}
  }

  private cloneCoordinates(coor: Coordinates){
    return {x: coor.x, y: coor.y}
  }

}

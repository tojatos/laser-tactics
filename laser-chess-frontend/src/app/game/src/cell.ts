import { Coordinates, CellInterface, PieceInterface } from "../game.models";
import { Board } from "./board";
import { Piece } from "./piece";

export class Cell implements CellInterface {
  coordinates: Coordinates
  canvasCoordinates: Coordinates
  piece: Piece | null

  constructor(coordinates: Coordinates, piece: PieceInterface | null, blockSize: number){
    this.coordinates = coordinates
    this.canvasCoordinates = this.canvasCoordinatesSetter(blockSize)
    this.piece = piece && new Piece(piece.piece_owner, piece.piece_type, piece.rotation_degree, this.cloneCoordinates(this.canvasCoordinates))
  }

  acceptNewPiece(piece: Piece){
    piece.currentCoordinates = this.cloneCoordinates(this.canvasCoordinates)
    this.piece = piece
  }

  changeCanvasCoordinates(size: number){
    this.canvasCoordinates = this.canvasCoordinatesSetter(size)
    if(this.piece)
      this.piece.currentCoordinates = this.cloneCoordinates(this.canvasCoordinates)
  }

  possibleMoves(board: Board){
    return this.piece?.getPossibleMoves(board, this)
  }

  private canvasCoordinatesSetter(size: number){
    return {x: this.coordinates.x.valueOf() * size + size / 2, y: this.coordinates.y.valueOf() * size + size / 2}
  }

  private cloneCoordinates(coor: Coordinates){
    return {x: coor.x, y: coor.y}
  }

}

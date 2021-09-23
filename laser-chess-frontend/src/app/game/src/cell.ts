import { Coordinates, CellInterface, PieceInterface } from "../game.models";
import { BLOCK_SIZE, PIECE_SIZE } from "./constants";
import { Piece } from "./Piece";

export class Cell implements CellInterface {
  coordinates: Coordinates
  canvasCoordinates: Coordinates
  piece: Piece | null

  constructor(coordinates: Coordinates, piece: PieceInterface | null){
    this.coordinates = coordinates
    this.piece = piece && new Piece(piece.piece_owner, piece.piece_type, piece.rotation_degree)
    this.canvasCoordinates = {x: coordinates.x.valueOf() * BLOCK_SIZE + BLOCK_SIZE / 2, y: coordinates.y.valueOf() * BLOCK_SIZE + BLOCK_SIZE / 2}
  }

  get cellDrawingOriginCoordinates(): Coordinates {
    return {x: - BLOCK_SIZE / 2, y: - BLOCK_SIZE / 2}
  }

  get pieceDrawingOriginCoordinates(): Coordinates {
    return {x: - PIECE_SIZE / 2, y: - PIECE_SIZE / 2}
  }

  get cellOnBoardCoordinates() : Coordinates {
    return { x: this.coordinates.x * BLOCK_SIZE + BLOCK_SIZE / 2, y: this.coordinates.y * BLOCK_SIZE + BLOCK_SIZE / 2 }
  }

}

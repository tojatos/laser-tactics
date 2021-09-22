import { Coordinates, CellInterface, PieceInterface } from "../game.models";
import { BLOCK_SIZE } from "./constants";
import { Piece } from "./Piece";

export class Cell implements CellInterface {
  coordinates: Coordinates
  canvasCoordinates: Coordinates
  piece: Piece | null

  constructor(coordinates: Coordinates, piece: PieceInterface | null, ctx: CanvasRenderingContext2D){
    this.coordinates = coordinates
    this.piece = piece && new Piece(piece.piece_owner, piece.piece_type, piece.rotation_degree)
    this.canvasCoordinates = {x: coordinates.x.valueOf() * BLOCK_SIZE + BLOCK_SIZE / 2, y: coordinates.y.valueOf() * BLOCK_SIZE + BLOCK_SIZE / 2}
    this.piece?.draw(ctx, this.canvasCoordinates)
  }

}

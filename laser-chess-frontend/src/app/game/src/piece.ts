import { Coordinates, PieceInterface } from "../game.models";
import { PIECE_SIZE } from "./constants";
import { PieceType } from "./PieceType";

export class Piece implements PieceInterface {
  piece_type: string
  piece_owner: string
  rotation_degree: number
  piece_img = new Image()

  constructor(owner: string, pieceType: string, rotation_degree: number){
    this.piece_owner = owner
    this.rotation_degree = rotation_degree
    //this.piece_type = (<any>PieceType)[pieceType] || "unknown"
    this.piece_type = pieceType

  }

  draw(ctx: CanvasRenderingContext2D, coordinates: Coordinates){
    this.piece_img.src = `assets/${this.piece_type}.png`
    this.piece_img.onload = () => {
      ctx.save()
      ctx.translate(coordinates.x, coordinates.y)
      ctx.rotate(this.rotation_degree / 360 * Math.PI)
      ctx.drawImage(this.piece_img, -PIECE_SIZE / 2, -PIECE_SIZE / 2)
      ctx.restore()
    }
  }

  getPossibleMoves(){}

}

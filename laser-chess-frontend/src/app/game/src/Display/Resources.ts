import { Injectable } from "@angular/core";
import { PieceColors, PieceType, PlayerType } from "../enums";
import { Piece } from "../piece";

export type PieceImageElement = {
  name: string,
  color: string | null
}

@Injectable()
export class Resources {

  boardImage: HTMLImageElement = new Image()
  pieceImages: Map<string, HTMLImageElement> = new Map()
  laserShotButton: HTMLImageElement = new Image()
  leftButton: HTMLImageElement = new Image()
  rightButton: HTMLImageElement = new Image()

  constructor(){ }

  async loadAssets(){
    await this.loadBoardImage()
    await this.loadPiecesImages()
    await this.loadButtonImages()
  }

  private async loadBoardImage(){
    await this.loadImage(this.boardImage, "assets/board.svg")
  }

  private async loadButtonImages(){
    await this.loadImage(this.laserShotButton, "assets/laser_shot_button.svg")
    await this.loadImage(this.rightButton, "assets/right_arrow.svg")
    await this.loadImage(this.leftButton, "assets/left_arrow.svg")
  }

  private async loadPiecesImages(){

    Object.values(PieceColors).forEach(p => {
      Promise.all([
        this.loadPieceElement(PieceType.BEAM_SPLITTER, p),
        this.loadPieceElement(PieceType.BLOCK, p),
        this.loadPieceElement(PieceType.DIAGONAL_MIRROR, p),
        this.loadPieceElement(PieceType.HYPER_CUBE, p),
        this.loadPieceElement(PieceType.KING, p),
        this.loadPieceElement(PieceType.LASER, p),
        this.loadPieceElement(PieceType.MIRROR, p),
        this.loadPieceElement(PieceType.TRIANGULAR_MIRROR, p)
      ])
    })

    await this.loadPieceElement(PieceType.HYPER_SQUARE, "")
    await this.loadPieceElement(PieceType.UNKNOWN, "")

  }

  private async loadPieceElement(name: string, color: string){

    const newImage: PieceImageElement = ({
      name: name,
      color: color
    })

    const image = new Image()

    await this.loadImage(image, `assets/${name + color}.svg`)
    this.pieceImages.set(JSON.stringify(newImage), image)
  }

  loadImage(image: HTMLImageElement, source: string){
    return new Promise<void>(resolve => {
      image.onload = () => resolve();
      image.src = source
    })
  }

  getPieceFromMap(piece: Piece){
    const unknownPiece = this.pieceImages.get(JSON.stringify({name: PieceType.UNKNOWN, color: ""}))!
    return this.pieceImages.get(JSON.stringify({name: piece.piece_type, color: piece.piece_owner == PlayerType.PLAYER_ONE ? PieceColors.RED : piece.piece_owner == PlayerType.PLAYER_TWO ? PieceColors.BLUE : ""})) || unknownPiece
  }

}

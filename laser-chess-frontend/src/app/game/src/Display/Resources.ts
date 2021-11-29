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
  move: () => HTMLAudioElement = () => new Audio("assets/sounds/move.wav")
  laser: () => HTMLAudioElement = () => new Audio("assets/sounds/laser.mp3")
  teleport: () => HTMLAudioElement = () => new Audio("assets/sounds/teleport.mp3")
  destroy: () => HTMLAudioElement = () => new Audio("assets/sounds/destroy.mp3")
  take: () => HTMLAudioElement = () => new Audio("assets/sounds/take.mp3")
  rotate: () => HTMLAudioElement = () => new Audio("assets/sounds/rotate.wav")
  deflect: () => HTMLAudioElement = () => new Audio("assets/sounds/deflect.mp3")

  constructor(){ }

  async loadAssets(){
    await this.loadBoardImage()
    await this.loadPiecesImages()
   }

  private async loadBoardImage(){
    await this.loadElement(this.boardImage, "assets/board.svg")
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

    await this.loadElement(image, `assets/${name + color}.svg`)
    this.pieceImages.set(JSON.stringify(newImage), image)
  }

  loadElement(elem: any, source: string){
    return new Promise<void>(resolve => {
      elem.onload = () => resolve();
      elem.src = source
    })
  }

  getPieceFromMap(piece: Piece){
    const unknownPiece = this.pieceImages.get(JSON.stringify({name: PieceType.UNKNOWN, color: ""}))!
    return this.pieceImages.get(JSON.stringify({name: piece.piece_type, color: piece.piece_owner == PlayerType.PLAYER_ONE ? PieceColors.RED : piece.piece_owner == PlayerType.PLAYER_TWO ? PieceColors.BLUE : ""})) || unknownPiece
  }

}

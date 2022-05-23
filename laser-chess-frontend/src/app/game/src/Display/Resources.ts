import { Injectable } from "@angular/core";
import { PieceColors, PieceType, PlayerType, Theme } from "../Utils/Enums";
import { Piece } from "../GameStateData/Piece";

export type PieceImageElement = {
  name: string,
  color: string | null
}

@Injectable()
export class Resources {

  boardImage: HTMLImageElement = new Image()
  pieceImages: Map<string, HTMLImageElement> = new Map()
  theme: Theme = Theme.CLASSIC

  move: () => HTMLAudioElement = () => new Audio(`assets/${this.theme}/sounds/move.wav`)
  laser: () => HTMLAudioElement = () => new Audio(`assets/${this.theme}/sounds/laser.mp3`)
  teleport: () => HTMLAudioElement = () => new Audio(`assets/${this.theme}/sounds/teleport.mp3`)
  destroy: () => HTMLAudioElement = () => new Audio(`assets/${this.theme}/sounds/destroy.mp3`)
  take: () => HTMLAudioElement = () => new Audio(`assets/${this.theme}/sounds/take.mp3`)
  rotate: () => HTMLAudioElement = () => new Audio(`assets/${this.theme}/sounds/rotate.wav`)
  deflect: () => HTMLAudioElement = () => new Audio(`assets/${this.theme}/sounds/deflect.mp3`)

  async loadAssets(theme: Theme): Promise<void>{
    this.theme = theme
    await this.loadBoardImage(theme)
    await this.loadPiecesImages(theme)
  }

  private async loadBoardImage(theme: string): Promise<void> {
    await this.loadElement(this.boardImage, `assets/${theme}/board.svg`)
  }

  private async loadPiecesImages(theme: string): Promise<void>{

    Object.values(PieceColors).forEach(p => {
      void Promise.all([
        this.loadPieceElement(PieceType.BEAM_SPLITTER, p, theme),
        this.loadPieceElement(PieceType.BLOCK, p, theme),
        this.loadPieceElement(PieceType.DIAGONAL_MIRROR, p, theme),
        this.loadPieceElement(PieceType.HYPER_CUBE, p, theme),
        this.loadPieceElement(PieceType.KING, p, theme),
        this.loadPieceElement(PieceType.LASER, p, theme),
        this.loadPieceElement(PieceType.MIRROR, p, theme),
        this.loadPieceElement(PieceType.TRIANGULAR_MIRROR, p, theme)
      ])
    })

    await this.loadPieceElement(PieceType.HYPER_SQUARE, "", theme)
    await this.loadPieceElement(PieceType.UNKNOWN, "", theme)

  }

  private async loadPieceElement(name: string, color: string, theme: string): Promise<void> {

    const newImage: PieceImageElement = ({
      name: name,
      color: color
    })

    const image = new Image()

    await this.loadElement(image, `assets/${theme}/${name + color}.svg`)
    this.pieceImages.set(JSON.stringify(newImage), image)
  }

  loadElement(elem: HTMLImageElement, source: string): Promise<void>{
    return new Promise<void>(resolve => {
      elem.onload = () => resolve();
      elem.src = source
    })
  }

  getPieceFromMap(piece: Piece): HTMLImageElement | undefined {
    const unknownPiece = this.pieceImages.get(JSON.stringify({name: PieceType.UNKNOWN, color: ""}))
    return this.pieceImages.get(JSON.stringify({name: piece.piece_type, color: piece.piece_owner == PlayerType.PLAYER_ONE ? PieceColors.RED : piece.piece_owner == PlayerType.PLAYER_TWO ? PieceColors.BLUE : ""})) || unknownPiece
  }

}

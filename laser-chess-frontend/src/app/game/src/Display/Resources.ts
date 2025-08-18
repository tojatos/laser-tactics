import { Injectable } from '@angular/core';
import { PieceColors, PieceType, PlayerType, Theme } from '../Utils/Enums';
import { Piece } from '../GameStateData/Piece';
import { Board } from '../GameStateData/Board';

export type PieceImageElement = {
  name: string;
  color: string | null;
};

@Injectable()
export class Resources {
  boardImage: HTMLImageElement = new Image();
  pieceImages: Map<string, HTMLImageElement> = new Map();
  theme: Theme = Theme.CLASSIC;

  move: () => HTMLAudioElement = () => new Audio(`assets/${this.theme}/sounds/move.wav`);
  laser: () => HTMLAudioElement = () => new Audio(`assets/${this.theme}/sounds/laser.mp3`);
  teleport: () => HTMLAudioElement = () => new Audio(`assets/${this.theme}/sounds/teleport.mp3`);
  destroy: () => HTMLAudioElement = () => new Audio(`assets/${this.theme}/sounds/destroy.mp3`);
  take: () => HTMLAudioElement = () => new Audio(`assets/${this.theme}/sounds/take.mp3`);
  rotate: () => HTMLAudioElement = () => new Audio(`assets/${this.theme}/sounds/rotate.wav`);
  deflect: () => HTMLAudioElement = () => new Audio(`assets/${this.theme}/sounds/deflect.mp3`);

  private async safePlayAudio(audioElement: HTMLAudioElement): Promise<void> {
    try {
      await audioElement.play();
    } catch (error) {
      // Silently handle autoplay restrictions - browser blocks audio until user interaction
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        // User hasn't interacted with the page yet, audio will be allowed after first interaction
        return;
      }
      // Log other audio errors that might be important
      console.warn('Audio playback failed:', error);
    }
  }

  playMove(): void {
    void this.safePlayAudio(this.move());
  }

  playLaser(): void {
    void this.safePlayAudio(this.laser());
  }

  playTeleport(): void {
    void this.safePlayAudio(this.teleport());
  }

  playDestroy(): void {
    void this.safePlayAudio(this.destroy());
  }

  playTake(): void {
    void this.safePlayAudio(this.take());
  }

  playRotate(): void {
    void this.safePlayAudio(this.rotate());
  }

  playDeflect(): void {
    void this.safePlayAudio(this.deflect());
  }

  async loadAssets(theme: Theme): Promise<void> {
    this.theme = theme;
    await this.loadBoardImage(theme);
    await this.loadPiecesImages(theme);
  }

  private async loadBoardImage(theme: string): Promise<void> {
    await this.loadElement(this.boardImage, `assets/${theme}/board.svg`);
  }

  private async loadPiecesImages(theme: string): Promise<void> {
    Object.values(PieceColors).forEach((colorSuffix) => {
      void Promise.all([
        this.loadPieceElement(PieceType.BEAM_SPLITTER, colorSuffix, theme),
        this.loadPieceElement(PieceType.BLOCK, colorSuffix, theme),
        this.loadPieceElement(PieceType.DIAGONAL_MIRROR, colorSuffix, theme),
        this.loadPieceElement(PieceType.HYPER_CUBE, colorSuffix, theme),
        this.loadPieceElement(PieceType.KING, colorSuffix, theme),
        this.loadPieceElement(PieceType.LASER, colorSuffix, theme),
        this.loadPieceElement(PieceType.MIRROR, colorSuffix, theme),
        this.loadPieceElement(PieceType.TRIANGULAR_MIRROR, colorSuffix, theme),
      ]);
    });

    await this.loadPieceElement(PieceType.HYPER_SQUARE, '', theme);
    await this.loadPieceElement(PieceType.UNKNOWN, '', theme);
  }

  private async loadPieceElement(name: string, color: string, theme: string): Promise<void> {
    const pieceKey = this.createPieceKey(name, color);
    const assetPath = `assets/${theme}/${name + color}.svg`;
    
    const image = new Image();
    try {
      await this.loadElement(image, assetPath);
      this.pieceImages.set(pieceKey, image);
    } catch (error) {
      console.error(`❌ Failed to load: ${pieceKey} from ${assetPath}`, error);
    }
  }

  loadElement(elem: HTMLImageElement, source: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      elem.onload = () => {
        resolve();
      };
      elem.onerror = () => {
        console.error(`Failed to load asset: ${source}`);
        reject(new Error(`Failed to load ${source}`));
      };
      elem.src = source;
    });
  }

  private isPlayerTypeEnum(owner: string): boolean {
    return owner === 'PLAYER_ONE' || owner === 'PLAYER_TWO' || owner === 'NONE';
  }
  
  private mapPlayerTypeStringToColor(playerTypeString: string): string {
    switch (playerTypeString) {
      case 'PLAYER_ONE':
        return PieceColors.RED;
      case 'PLAYER_TWO':
        return PieceColors.BLUE;
      default:
        return '';
    }
  }

  private getFallbackColor(piece: Piece): string {
    const owner = piece.piece_owner || '';
    
    // First check if the owner is actually a PlayerType enum value
    if (this.isPlayerTypeEnum(owner)) {
      const color = this.mapPlayerTypeStringToColor(owner);
      if (color) {
        return color;
      }
    }
    
    // Fallback: Try to determine color from piece owner pattern
    const lowerOwner = owner.toLowerCase();
    
    if (lowerOwner.includes('red') || lowerOwner.includes('player1') || lowerOwner.includes('p1') || lowerOwner.includes('player_one')) {
      return PieceColors.RED;
    }
    
    if (lowerOwner.includes('blue') || lowerOwner.includes('player2') || lowerOwner.includes('p2') || lowerOwner.includes('player_two')) {
      return PieceColors.BLUE;
    }
    
    console.warn(`⚠️ No fallback color could be determined for owner: "${piece.piece_owner}"`);
    return '';
  }

  private determinePlayerColor(piece: Piece, board: Board): string {
    // If piece owner is a PlayerType enum, use direct mapping
    if (piece.piece_owner && this.isPlayerTypeEnum(piece.piece_owner)) {
      return this.mapPlayerTypeStringToColor(piece.piece_owner);
    }
    
    // Try normal player ID resolution
    const playerType = board.parsePlayerIdToPlayerNumber(piece.piece_owner);
    const color = this.mapPlayerTypeToColor(playerType);
    
    // If no color determined, try fallback
    if (!color) {
      return this.getFallbackColor(piece);
    }
    
    return color;
  }
  
  private mapPlayerTypeToColor(playerType: PlayerType): string {
    switch (playerType) {
      case PlayerType.PLAYER_ONE:
        return PieceColors.RED;
      case PlayerType.PLAYER_TWO:
        return PieceColors.BLUE;
      default:
        console.warn(`⚠️ Unknown player type: ${playerType}, defaulting to empty color`);
        return '';
    }
  }
  
  private createPieceKey(pieceName: string, color: string): string {
    return JSON.stringify({
      name: pieceName,
      color: color
    });
  }
  
  private logPieceImageLookup(pieceKey: string, found: boolean): void {
    if (!found) {
      console.warn(`❌ Piece image not found for key: ${pieceKey}, falling back to unknown piece`);
      console.warn(`📋 Available piece keys:`, Array.from(this.pieceImages.keys()));
    }
  }

  getPieceFromMap(piece: Piece, board?: Board): HTMLImageElement | undefined {
    const unknownPieceKey = this.createPieceKey(PieceType.UNKNOWN, '');
    const unknownPiece = this.pieceImages.get(unknownPieceKey);
    
    let pieceColor = '';
    if (board) {
      pieceColor = this.determinePlayerColor(piece, board);
    } else {
      console.warn(`🚫 Board is null/undefined when trying to get piece image for ${piece.piece_type}`);
    }
    
    const pieceKey = this.createPieceKey(piece.piece_type, pieceColor);
    const pieceImage = this.pieceImages.get(pieceKey);
    const imageFound = !!pieceImage;
    
    this.logPieceImageLookup(pieceKey, imageFound);
    
    return pieceImage || unknownPiece;
  }
}

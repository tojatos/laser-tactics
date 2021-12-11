import { Board } from "../../GameStateData/Board";
import { GameActions } from "./GameActions";
import { GameCanvas } from "./GameCanvas";

export class GameMediator {

  constructor(public gameCanvas: GameCanvas, public gameActions: GameActions){}

  sendLaserShotInfo(board: Board): void{
    this.gameCanvas.redrawGame(board)
    this.gameCanvas.interactable = false
  }

  async sendRotationInfo(board: Board, rotation: number, initialRotationDifference = 0): Promise<void>{
    await this.gameCanvas.rotationButtonPressed(board, rotation, initialRotationDifference)
  }

  sendPossibleMovesShowRequest(board: Board): void{
    this.gameCanvas.highlightPossibleMoves(board)
  }

  sendSelectionInfoToActionPanel(board: Board): void{
    this.gameActions.newCellSelectedEvent(board)
  }

  drawGameOnGameCanvas(board: Board): void{
    this.gameCanvas.redrawGame(board)
  }

  disableGameActionsButtons(): void{
    this.gameActions.disableButtons()
  }

  rotatePieceToInitPosition(board: Board): void{
    void this.gameActions.rotatePieceToInitialPosition(board)
  }

  showPossibleMoves(board: Board): void{
    this.gameCanvas.highlightPossibleMoves(board)
  }

  get currentRotation(): number{
    return this.gameActions.rotation
  }

}

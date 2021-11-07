import { Coordinates } from "src/app/game/game.models";
import { Board } from "../../board";
import { GameActions } from "./GameActions";
import { GameCanvas } from "./GameCanvas";

export class GameMediator {

  constructor(public gameCanvas: GameCanvas, public gameActions: GameActions){}

  sendLaserShotInfo(board: Board){
    this.gameCanvas.redrawGame(board)
    this.gameCanvas.interactable = false
  }

  async sendRotationInfo(board: Board, rotation: number, initialRotationDifference: number = 0){
    await this.gameCanvas.rotationButtonPressed(board, rotation, initialRotationDifference)
  }

  sendPossibleMovesShowRequest(board: Board){
    this.gameCanvas.highlightPossibleMoves(board)
  }

  sendSelectionInfoToGuiCanvas(board: Board){
    this.gameActions.newCellSelectedEvent(board)
  }

  drawGameOnGameCanvas(board: Board){
    this.gameCanvas.redrawGame(board)
  }

  passHoverInfoToGameCanvas(board: Board, mousePos: Coordinates){
    this.gameCanvas.hoverEvent(mousePos, board)
  }

  passClickInfoToGameCanvas(board: Board, mousePos: Coordinates){
    this.gameCanvas.mouseEventFromGui(mousePos, board)
  }

  disableGameActionsButtons(){
    this.gameActions.disableButtons()
  }

  rotatePieceToInitPosition(board: Board){
    this.gameActions.rotatePieceToInitialPosition(board)
  }

  get currentRotation(){
    return this.gameActions.rotation
  }

}

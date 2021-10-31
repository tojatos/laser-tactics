import { Coordinates } from "src/app/game/game.models";
import { Board } from "../../board";
import { GameCanvas } from "./GameCanvas";
import { GUICanvas } from "./GUICanvas";

export class CanvasMediator {

  constructor(public gameCanvas: GameCanvas, public guiCanvas: GUICanvas){}

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
    this.guiCanvas.newCellSelectedEvent(board)
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

}

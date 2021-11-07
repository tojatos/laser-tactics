import { EventEmitterService } from "src/app/game/services/event-emitter.service"
import { GameWebsocketService } from "src/app/game/services/gameService/game-websocket.service"
import { Board } from "../../board"
import { PieceType } from "../../enums"
import { GameMediator } from "./CanvasMediator"
import { GameCanvas } from "./GameCanvas"

export class GameActions {

  rotation: number = 0
  mediator!: GameMediator

  rotationActive = false
  acceptActive = false
  laserActive = false

  constructor(private gameService: GameWebsocketService, private eventEmitter: EventEmitterService, private gameId: string) {}

  initCanvas(gameCanvas: GameCanvas){
    this.mediator = new GameMediator(gameCanvas, this)
  }

  newCellSelectedEvent(board: Board){
    const selectedCell = board.selectedCell

    if(selectedCell?.piece){
      if(
        selectedCell.piece.piece_type != PieceType.UNKNOWN &&
        selectedCell.piece.piece_type != PieceType.KING &&
        selectedCell.piece.piece_type != PieceType.HYPER_SQUARE &&
        selectedCell.piece.piece_type != PieceType.HYPER_CUBE
      )
        this.rotationActive = true

      if(selectedCell.piece.piece_type == PieceType.LASER)
          this.laserActive = true
    }
  }

  async rotationPressed(board: Board, degree: number){

    this.disableButtons()

    await this.mediator.sendRotationInfo(board, degree, this.rotation)

    this.rotation += degree
    if(this.rotation < 0)
      this.rotation = 360 + this.rotation
    this.rotation %= 360

    this.rotationActive = true

    if(this.rotation == 0){
      if(board.selectedCell?.piece?.piece_type == PieceType.LASER)
        this.laserActive = true
    }
    else {
      this.acceptActive = true
    }

  }

  acceptRotationButtonPressed(board: Board){
    const selectedCell = board.selectedCell

    if(selectedCell){
      board.rotatePiece(selectedCell.coordinates, this.rotation)
      this.gameService.increaseAnimationEvents()
      this.gameService.rotatePiece(this.gameId, selectedCell.coordinates, this.rotation)
      board.currentTurn++
      this.unselectCellEvent(board)
      this.disableButtons()
    }
    else
      alert("No piece selected")

    this.rotation = 0

  }

  private unselectCellEvent(board: Board){
    this.mediator.drawGameOnGameCanvas(board)
    board.unselectCell()
  }

  laserButtonPressed(board: Board){
    const laserCell = board.getMyLaser()
    if(laserCell){
      this.mediator.sendLaserShotInfo(board)
      board.currentTurn++
      this.unselectCellEvent(board)
      this.gameService.shootLaser(this.gameId)
    }
    this.disableButtons()
  }

  disableButtons(){
    this.rotationActive = false
    this.laserActive = false
    this.acceptActive = false
  }

  async rotatePieceToInitialPosition(board: Board){
    if(this.rotation != 0){
      await this.mediator.sendRotationInfo(board, this.rotation < 180 ? -this.rotation : 360 - this.rotation, this.rotation)
      this.rotation = 0
      this.mediator.drawGameOnGameCanvas(board)
    }
  }

}

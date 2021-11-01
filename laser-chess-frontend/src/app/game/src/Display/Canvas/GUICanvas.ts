import { AuthService } from "src/app/auth/auth.service"
import { EventEmitterService } from "src/app/game/services/event-emitter.service"
import { GameService } from "src/app/game/services/game.service"
import { Board } from "../../board"
import { COLS, ROWS } from "../../constants"
import { ButtonTypes, PieceType } from "../../enums"
import { Animations } from "../Animations"
import { Drawings } from "../Drawings"
import { Resources } from "../Resources"
import { Canvas } from "./AbstractCanvas"
import { Button } from "../Button"
import { CanvasMediator } from "./CanvasMediator"
import { GameCanvas } from "./GameCanvas"

export class GUICanvas extends Canvas {

  rotation: number = 0
  mediator!: CanvasMediator
  buttons: Button[] = []

  constructor( private gameService: GameService,
    authService: AuthService,
    private eventEmitter: EventEmitterService,
    animations: Animations,
    drawings: Drawings,
    ctx: CanvasRenderingContext2D,
    blockSize: number,
    resources: Resources,
    gameId: string) {
    super(authService, ctx, blockSize, animations, drawings, resources, gameId)
  }

  initCanvas(board: Board, gameCanvas: GameCanvas){
    this.mediator = new CanvasMediator(gameCanvas, this)
    this.ctx.canvas.addEventListener('click', async (e) => await this.canvasOnclick(e, board), false)
    this.ctx.canvas.addEventListener('mousemove', (e) => this.canvasHover(e, board), false)
    this.ctx.canvas.hidden = true
  }

  private async canvasOnclick(event: MouseEvent, board: Board) {
    const mousePos = this.getMousePos(event)
    const rawMousePos = this.getRawMousePos(event)

    for (const button of this.buttons){
      if(button.checkIfPressed(rawMousePos)){
        switch(button.buttonType){
          case(ButtonTypes.RIGHT_ARROW_BUTTON): await this.rotationPressed(board, 90); break;
          case(ButtonTypes.LEFT_ARROW_BUTTON): await this.rotationPressed(board, -90); break;
          case(ButtonTypes.LASER_BUTTON): this.laserButtonPressed(board); break;
          case(ButtonTypes.ACCEPT_BUTTON): this.acceptRotationButtonPressed(board, this.rotation); break;
        }
        return
      }
    }

    this.hideCanvas()

    if(this.rotation != 0){
      await this.mediator.sendRotationInfo(board, this.rotation < 180 ? -this.rotation : 360 - this.rotation, this.rotation)
      this.rotation = 0
      board.unselectCell()
      this.mediator.drawGameOnGameCanvas(board)
    }

    this.mediator.passClickInfoToGameCanvas(board, mousePos)
  }

  private canvasHover(event: MouseEvent, board: Board){
    if(this.rotation == 0)
      this.mediator.passHoverInfoToGameCanvas(board, this.getMousePos(event))
  }

  changeBlockSize(newSize: number){
    this.blockSize = newSize
    this.ctx.canvas.width = COLS * this.blockSize
    this.ctx.canvas.height = ROWS * this.blockSize
    this.drawings.clearBoard(this)
    this.updateButtonsParameters(newSize)
    this.showButtons()
  }

  hideCanvas(){
    this.drawings.clearBoard(this)
    this.buttons = []
    this.ctx.canvas.hidden = true
  }

  updateButtonsParameters(newBlockSize: number){
    for(const button of this.buttons)
      button.updateSizes(newBlockSize)
  }

  showButtons(){
    if(this.buttons.length > 0){
      this.ctx.canvas.hidden = false
      for (const button of this.buttons)
        this.drawings.drawButton(this, button)
    }
  }

  removeButton(type: ButtonTypes){
    for (const button of this.buttons)
      if(button.buttonType == type){
        this.buttons.splice(this.buttons.indexOf(button), 1)
        return
      }
  }

  addButton(type: ButtonTypes, image: HTMLImageElement){
    const exists = this.buttons.some(b => b.buttonType == type)
    if(!exists){
      this.buttons.push(new Button(this.blockSize, type, image))
    }
    return !exists
  }

  newCellSelectedEvent(board: Board){
    const selectedCell = board.selectedCell

    if(selectedCell?.piece){
      if(
        selectedCell.piece.piece_type != PieceType.UNKNOWN &&
        selectedCell.piece.piece_type != PieceType.KING &&
        selectedCell.piece.piece_type != PieceType.HYPER_SQUARE &&
        selectedCell.piece.piece_type != PieceType.HYPER_CUBE
      ){
        this.addButton(ButtonTypes.RIGHT_ARROW_BUTTON, this.resources.rightButton)
        this.addButton(ButtonTypes.LEFT_ARROW_BUTTON, this.resources.leftButton)
      }

      if(selectedCell.piece.piece_type == PieceType.LASER)
          this.addButton(ButtonTypes.LASER_BUTTON, this.resources.laserShotButton)

      this.showButtons()

    }
  }

  async rotationPressed(board: Board, degree: number){
    await this.mediator.sendRotationInfo(board, degree, this.rotation)
    this.rotation += degree
    if(this.rotation < 0)
      this.rotation = 360 + this.rotation
    this.rotation %= 360

    this.removeButton(ButtonTypes.LASER_BUTTON)
    this.removeButton(ButtonTypes.ACCEPT_BUTTON)

    if(this.rotation == 0){
      if(board.selectedCell?.piece?.piece_type == PieceType.LASER)
        this.addButton(ButtonTypes.LASER_BUTTON, this.resources.laserShotButton)
    }
    else
      this.addButton(ButtonTypes.ACCEPT_BUTTON, this.resources.acceptButton)

    this.drawings.clearBoard(this)
    this.showButtons()

    if(this.rotation == 0)
      this.mediator.sendPossibleMovesShowRequest(board)
  }

  acceptRotationButtonPressed(board: Board, rotation: number){
    const selectedCell = board.selectedCell

    if(selectedCell){
      board.rotatePiece(selectedCell.coordinates, this.rotation)
      this.gameService.rotatePiece(this.gameId, selectedCell.coordinates, rotation)
      this.gameService.increaseAnimationEvents()
      board.currentTurn++
      this.unselectCellEvent(board)
    }
    else
      alert("No piece selected")

    this.rotation = 0
    this.hideCanvas()
    this.eventEmitter.invokeRefresh()
  }

  private unselectCellEvent(board: Board){
    this.mediator.drawGameOnGameCanvas(board)
    board.unselectCell()
    this.ctx.canvas.hidden = true
  }

  laserButtonPressed(board: Board){
    const laserCell = board.getMyLaser()
    if(laserCell){
      this.hideCanvas()
      this.mediator.sendLaserShotInfo(board)
      board.currentTurn++
      this.unselectCellEvent(board)
      this.gameService.shootLaser(this.gameId)
      .finally(() => {
        this.eventEmitter.invokeRefresh()
      })
    }
  }

}

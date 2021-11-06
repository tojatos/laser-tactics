import { AuthService } from "src/app/auth/auth.service"
import { EventEmitterService } from "../../../services/event-emitter.service"
import { Coordinates } from "../../../game.models"
import { GameService } from "../../../services/gameService/game.service"
import { Board } from "../../board"
import { Cell } from "../../cell"
import { Animations } from "../Animations"
import { Drawings } from "../Drawings"
import { Resources } from "../Resources"
import { Canvas } from "./AbstractCanvas"
import { GUICanvas } from "./GUICanvas"
import { CanvasMediator } from "./CanvasMediator"
import { COLS, ROWS } from "../../constants"
import { PieceType } from "../../enums"

export class GameCanvas extends Canvas {

    hoveredCell: Cell | undefined
    mediator: CanvasMediator | undefined
    showAnimations: boolean = true

    constructor(gameService: GameService,
      authService: AuthService,
      private eventEmitter: EventEmitterService,
      animations: Animations,
      drawings: Drawings,
      ctx: CanvasRenderingContext2D,
       blockSize: number,
       resources: Resources,
       gameId: string) {
        super(gameService, authService, ctx, blockSize, animations, drawings, resources, gameId)
    }

    initCanvas(board: Board, guiCanvas: GUICanvas){
      this.ctx.canvas.addEventListener('click', (e) => this.canvasOnclick(e, board), false)
      this.ctx.canvas.addEventListener('mousemove', (e) => this.canvasHover(e, board), false)
      this.drawings.drawGame(this, board.cells)
      this.mediator = new CanvasMediator(this, guiCanvas)
    }

    private canvasOnclick(event: MouseEvent, board: Board) {
      this.onClickEvent(this.getMousePos(event), board)
    }

    async onClickEvent(mousePos: Coordinates, board: Board){
      if(!this.interactable)
        return

      const selectedCell = board.getSelectableCellByCoordinates(mousePos.x, mousePos.y, this.currentPlayer)
      this.interactable = false

      if(board.selectedCell){
        await this.selectableCellEvent(selectedCell, board)
      }
      else {
        if(selectedCell){
          this.selectCellEvent(selectedCell, board)
          this.mediator?.sendSelectionInfoToGuiCanvas(board)
        }
      }

      const myTurn = board.isMyTurn()
      this.interactable = myTurn

      if(!this.interactable){
        this.redrawGame(board)
        this.mediator?.clearGuiCanvas()
      }

    }

    mouseEventFromGui(mousePos: Coordinates, board: Board){
      if(this.interactable){
        const selectedCell = board.getSelectableCellByCoordinates(mousePos.x, mousePos.y, this.currentPlayer)

        if(board.selectedCell?.piece?.piece_type == PieceType.LASER)
          this.unselectCellEvent(board)

        else if(selectedCell)
          this.selectableCellEvent(selectedCell, board)
      }

    }

    private async selectableCellEvent(selectedCell: Cell | undefined, board: Board){
      this.interactable = false
      if(board.selectedCell && selectedCell){
        await this.makeAMoveEvent(selectedCell.coordinates, board, this.showAnimations)
        this.gameService.movePiece(this.gameId, board.selectedCell.coordinates, selectedCell.coordinates)
        .then(async () => {
          this.gameService.increaseAnimationEvents()
          board.movePiece(board.selectedCell!.coordinates, selectedCell.coordinates)
          this.gameService.setLocalGameState(board.serialize())
          board.currentTurn++
          this.eventEmitter.invokeRefresh()
        })
        .finally(() => {
          this.unselectCellEvent(board)
          this.interactable = true
        })
      }
      else {
        this.unselectCellEvent(board)
        this.interactable = true
      }

    }

    private canvasHover(event: MouseEvent, board: Board) {
      this.hoverEvent(this.getMousePos(event), board)
    }

    hoverEvent(mousePos: Coordinates, board: Board){
      if(board.selectedCell && this.interactable){
        const hoveredOver = board.getCellByCoordinates(mousePos.x, mousePos.y)
        if(hoveredOver && hoveredOver != this.hoveredCell){
          if(board.selectedCell.possibleMoves(board)?.includes(hoveredOver)){
            this.drawings.drawSingleCell(this, hoveredOver)
            this.drawings.highlightCell(this, hoveredOver)
          }
          else {
            if(this.hoveredCell && board.selectedCell.possibleMoves(board)?.includes(this.hoveredCell)){
              this.drawings.drawSingleCell(this, this.hoveredCell)
              this.drawings.showPossibleMove(this, this.hoveredCell)
            }
          }
          this.hoveredCell = hoveredOver
        }
      }
    }

    async rotationButtonPressed(board: Board, degree: number, initialRotationDifference: number){
      const selectedCell = board.selectedCell

      if(selectedCell){
        this.interactable = false
        await this.animations.rotatePiece(this, board, selectedCell, degree, this.showAnimations, initialRotationDifference)
        this.interactable = true
      }
    }

    changeBlockSize(newSize: number, board: Board){
      this.blockSize = newSize
      this.ctx.canvas.width = COLS * this.blockSize
      this.ctx.canvas.height = ROWS * this.blockSize
      this.drawings.drawGame(this, board.cells)
    }

    redrawGame(board: Board){
      this.drawings.drawGame(this, board.cells)
      this.interactable = true
    }

    private selectCellEvent(selectedCell: Cell, board: Board){
      board.selectCell(selectedCell)
      this.drawings.highlightCell(this, selectedCell)
      selectedCell.piece?.getPossibleMoves(board, selectedCell).forEach(c => this.drawings.showPossibleMove(this, c))
    }

    highlightPossibleMoves(board: Board){
      if(board.selectedCell)
        board.selectedCell.piece?.getPossibleMoves(board, board.selectedCell).forEach(c => this.drawings.showPossibleMove(this, c))
    }

    private unselectCellEvent(board: Board){
      board.unselectCell()
      this.drawings.drawGame(this, board.cells)
    }

    private makeAMoveEvent(coor: Coordinates, board: Board, showAnimations: boolean): Promise<void>{
      return this.animations.movePiece(this, board, board.selectedCell!.coordinates, coor, showAnimations)
    }

}

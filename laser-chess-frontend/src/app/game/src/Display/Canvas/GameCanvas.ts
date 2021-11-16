import { AuthService } from "src/app/auth/auth.service"
import { Coordinates } from "../../../game.models"
import { Board } from "../../board"
import { Cell } from "../../cell"
import { Animations } from "../Animations"
import { Drawings } from "../Drawings"
import { Resources } from "../Resources"
import { Canvas } from "./AbstractCanvas"
import { GameMediator } from "./CanvasMediator"
import { COLS, ROWS } from "../../constants"
import { GameWebsocketService } from "src/app/game/services/gameService/game-websocket.service"
import { GameActions } from "./GameActions"

export class GameCanvas extends Canvas {

    hoveredCell: Cell | undefined
    mediator: GameMediator | undefined
    showAnimations: boolean = true

    constructor(gameService: GameWebsocketService,
      authService: AuthService,
      animations: Animations,
      drawings: Drawings,
      ctx: CanvasRenderingContext2D,
       blockSize: number,
       resources: Resources,
       gameId: string) {
        super(gameService, authService, ctx, blockSize, animations, drawings, resources, gameId)
    }

    initCanvas(board: Board, gameActions: GameActions){
      this.ctx.canvas.addEventListener('click', (e) => this.canvasOnclick(e, board), false)
      this.ctx.canvas.addEventListener('mousemove', (e) => this.canvasHover(e, board), false)
      this.drawings.drawGame(this, board.cells, this.isReversed)
      this.mediator = new GameMediator(this, gameActions)
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
          this.mediator?.sendSelectionInfoToActionPanel(board)
        }
      }

      const myTurn = board.isMyTurn()
      this.interactable = myTurn

      if(!this.interactable){
        this.redrawGame(board)
      }

    }

    private async selectableCellEvent(selectedCell: Cell | undefined, board: Board){
      this.interactable = false
      if(board.selectedCell && selectedCell){
        await this.makeAMoveEvent(selectedCell.coordinates, board, this.showAnimations)
        this.gameService.increaseAnimationEvents()
        board.movePiece(board.selectedCell!.coordinates, selectedCell.coordinates)
        board.currentTurn++
        this.gameService.movePiece(this.gameId, board.selectedCell.coordinates, selectedCell.coordinates)
        if(board.isMyTurn())
          this.interactable = true
        this.unselectCellEvent(board)
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
      if(board.selectedCell && this.interactable && this.mediator?.currentRotation == 0){
        const hoveredOver = board.getCellByCoordinates(mousePos.x, mousePos.y)
        if(hoveredOver && hoveredOver != this.hoveredCell){
          if(board.selectedCell.possibleMoves(board)?.includes(hoveredOver)){
            this.drawings.drawSingleCell(this, hoveredOver, this.isReversed)
            this.drawings.highlightCell(this, hoveredOver, this.isReversed)
          }
          else {
            if(this.hoveredCell && board.selectedCell.possibleMoves(board)?.includes(this.hoveredCell)){
              this.drawings.drawSingleCell(this, this.hoveredCell, this.isReversed)
              this.drawings.showPossibleMove(this, this.hoveredCell, this.isReversed)
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
        await this.animations.rotatePiece(this, board, selectedCell, degree, this.isReversed, this.showAnimations, initialRotationDifference)
        this.interactable = true
      }

    }

    changeBlockSize(newSize: number, board: Board){
      this.blockSize = newSize
      this.ctx.canvas.width = COLS * this.blockSize
      this.ctx.canvas.height = ROWS * this.blockSize
      this.drawings.drawGame(this, board.cells, this.isReversed)
    }

    redrawGame(board: Board){
      this.drawings.drawGame(this, board.cells, this.isReversed)
      this.interactable = true
    }

    private selectCellEvent(selectedCell: Cell, board: Board){
      board.selectCell(selectedCell)
      this.drawings.highlightCell(this, selectedCell, this.isReversed)
      selectedCell.piece?.getPossibleMoves(board, selectedCell).forEach(c => this.drawings.showPossibleMove(this, c, this.isReversed))
    }

    highlightPossibleMoves(board: Board){
      if(board.selectedCell)
        board.selectedCell.piece?.getPossibleMoves(board, board.selectedCell).forEach(c => this.drawings.showPossibleMove(this, c, this.isReversed))
    }

    private unselectCellEvent(board: Board){
      this.mediator?.disableGameActionsButtons()
      this.mediator?.rotatePieceToInitPosition(board)
      board.unselectCell()
      this.drawings.drawGame(this, board.cells, this.isReversed)
    }

    private makeAMoveEvent(coor: Coordinates, board: Board, showAnimations: boolean): Promise<void>{
      return this.animations.movePiece(this, board, board.selectedCell!.coordinates, coor, this.isReversed, showAnimations)
    }

}

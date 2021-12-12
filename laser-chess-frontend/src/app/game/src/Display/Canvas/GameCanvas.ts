import { AuthService } from "src/app/auth/auth.service"
import { Coordinates } from "../../../game.models"
import { Board } from "../../GameStateData/Board"
import { Cell } from "../../GameStateData/Cell"
import { Animations } from "../Animations"
import { Drawings } from "../Drawings"
import { Resources } from "../Resources"
import { Canvas } from "./Canvas"
import { GameMediator } from "./CanvasMediator"
import { COLS, ROWS } from "../../Utils/Constants"
import { GameWebsocketService } from "src/app/game/services/game.service"
import { GameActions } from "./GameActions"
import { EventsColors } from "../../Utils/Enums"

export class GameCanvas extends Canvas {

    hoveredCell: Cell | undefined
    mediator: GameMediator | undefined
    currentPlayer = this.authService.getUsername()

    constructor(private gameService: GameWebsocketService,
      private authService: AuthService,
      private animations: Animations,
      private drawings: Drawings,
      canvas: HTMLCanvasElement,
      blockSize: number,
      resources: Resources,
      private gameId: string,
      public enableSounds: boolean) {
        super(canvas, blockSize, resources)
    }

    initCanvas(board: Board, gameActions: GameActions): void{
      this.ctx.canvas.addEventListener('click', (e) => this.canvasOnclick(e, board), false)
      this.ctx.canvas.addEventListener('mousemove', (e) => this.canvasHover(e, board), false)
      this.drawings.drawGame(this, board.cells, this.isReversed)
      this.mediator = new GameMediator(this, gameActions)
    }

    private canvasOnclick(event: MouseEvent, board: Board) {
      void this.onClickEvent(this.getMousePos(event), board)
    }

    async onClickEvent(mousePos: Coordinates, board: Board): Promise<void>{
      if(!this.interactable)
        return
      this.drawings.drawGame(this, board.cells, this.isReversed)
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
      this.drawings.drawGame(this, board.cells, this.isReversed)
      if(board.selectedCell && selectedCell && this.mediator?.currentRotation == 0){
        await this.makeAMoveEvent(selectedCell.coordinates, board, this.showAnimations, this.enableSounds)
        this.gameService.increaseAnimationEvents()
        board.movePiece(board.selectedCell!.coordinates, selectedCell.coordinates)
        this.gameService.movePiece(this.gameId, board.selectedCell.coordinates, selectedCell.coordinates)
        if(board.isMyTurn())
          this.interactable = true
        this.unselectCellEvent(board)
      }
      else {
        this.unselectCellEvent(board)
        this.drawings.drawGame(this, board.cells, this.isReversed)
        this.interactable = true
      }
    }

    private canvasHover(event: MouseEvent, board: Board) {
      this.hoverEvent(this.getMousePos(event), board)
    }

    hoverEvent(mousePos: Coordinates, board: Board): void{
      if(board.selectedCell && this.interactable && this.mediator?.currentRotation == 0){
        const hoveredOver = board.getCellByCoordinates(mousePos.x, mousePos.y)
        if(hoveredOver && hoveredOver != this.hoveredCell){
          if(board.selectedCell.possibleMoves(board)?.includes(hoveredOver)){
            this.drawings.drawSingleCell(this, hoveredOver, this.isReversed)
            this.drawings.highlightCell(this, hoveredOver, this.isReversed, hoveredOver.piece || undefined, EventsColors.MOVE_EVENT)
          }
          else {
            if(this.hoveredCell && board.selectedCell.possibleMoves(board)?.includes(this.hoveredCell)){
              this.drawings.drawSingleCell(this, this.hoveredCell, this.isReversed)
              this.drawings.showPossibleMove(this, this.hoveredCell, this.isReversed, EventsColors.MOVE_EVENT)
            }
          }
          this.hoveredCell = hoveredOver
        }
      }
    }

    async rotationButtonPressed(board: Board, degree: number, initialRotationDifference: number): Promise<void>{
      const selectedCell = board.selectedCell

      if(selectedCell){
        this.interactable = false
        await this.animations.rotatePiece(this, board, selectedCell, degree, this.isReversed, this.showAnimations, this.enableSounds, initialRotationDifference)
        this.interactable = true
      }

    }

    changeBlockSize(newSize: number, board: Board): void{
      this.blockSize = newSize
      this.ctx.canvas.width = COLS * this.blockSize
      this.ctx.canvas.height = ROWS * this.blockSize
      this.drawings.drawGame(this, board.cells, this.isReversed)
    }

    redrawGame(board: Board): void{
      this.drawings.drawGame(this, board.cells, this.isReversed)
      this.interactable = true
    }

    private selectCellEvent(selectedCell: Cell, board: Board): void{
      board.selectCell(selectedCell)
      this.drawings.highlightCell(this, selectedCell, this.isReversed, selectedCell.piece || undefined, EventsColors.MOVE_EVENT)
      selectedCell.piece?.getPossibleMoves(board, selectedCell).forEach(c => this.drawings.showPossibleMove(this, c, this.isReversed, EventsColors.MOVE_EVENT))
    }

    highlightPossibleMoves(board: Board): void{
      if(board.selectedCell)
        board.selectedCell.piece?.getPossibleMoves(board, board.selectedCell).forEach(c => this.drawings.showPossibleMove(this, c, this.isReversed, EventsColors.MOVE_EVENT))
    }

    private unselectCellEvent(board: Board){
      this.mediator?.disableGameActionsButtons()
      this.mediator?.rotatePieceToInitPosition(board)
      board.unselectCell()
    }

    private makeAMoveEvent(coor: Coordinates, board: Board, showAnimations: boolean, enableSounds: boolean): Promise<void> | undefined{
      if(board.selectedCell)
        return this.animations.movePiece(this, board, board.selectedCell.coordinates, coor, this.isReversed, showAnimations, enableSounds)
      return undefined
    }

    private getMousePos(event: MouseEvent){
      const rect = this.ctx.canvas.getBoundingClientRect();

      if(this.isReversed)
        return {
          x: COLS - 1 - Math.floor((event.clientX - rect.left) / this.blockSize),
          y: Math.floor((event.clientY - rect.top) / this.blockSize)
        }

      return {
        x: Math.floor((event.clientX - rect.left) / this.blockSize),
        y: ROWS - 1 - Math.floor((event.clientY - rect.top) / this.blockSize)
      }
    }

    private getRawMousePos(event: MouseEvent){
      const rect = this.ctx.canvas.getBoundingClientRect();

      return {
        x: Math.floor((event.clientX - rect.left)),
        y: Math.floor((event.clientY - rect.top))
      }
    }


}

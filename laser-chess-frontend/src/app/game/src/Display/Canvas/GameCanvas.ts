import { Inject, Injectable } from "@angular/core"
import { AuthService } from "src/app/auth/auth.service"
import { EventEmitterService } from "../../../services/event-emitter.service"
import { Coordinates } from "../../../game.models"
import { GameService } from "../../../services/game.service"
import { Board } from "../../board"
import { Cell } from "../../cell"
import { COLS, ROWS } from "../../constants"
import { Animations } from "../Animations"
import { Drawings } from "../Drawings"
import { Resources } from "../Resources"
import { EventsExecutor } from "../../eventsExecutor"
import { PieceType } from "../../enums"
import { Canvas } from "./AbstractCanvas"

@Injectable()
export class GameCanvas extends Canvas {

    animations!: Animations
    interactable: boolean = false
    block_size!: number
    highlightColor: string = "yellow"
    hoveredCell: Cell | undefined
    gameId!: string
    currentPlayer = this.authService.getCurrentJwtInfo().sub
    eventsExecutor = new EventsExecutor(this, this.gameService)

    constructor(private gameService: GameService, @Inject(Resources) resources: Resources, private authService: AuthService, private eventEmitter: EventEmitterService) {
      super(resources)
    }

    async initCanvas(ctx: CanvasRenderingContext2D, board: Board, size: number, gameId: string){
      await this.resources.loadAssets()
      this.block_size = size
      this.ctx = ctx
      this.ctx.canvas.width = COLS * this.block_size
      this.ctx.canvas.height = ROWS * this.block_size
      this.drawings = new Drawings(ctx, this.block_size, this.resources)
      this.animations = new Animations(this.drawings)
      this.ctx.canvas.addEventListener('click', (e) => this.canvasOnclick(e, board), false)
      this.ctx.canvas.addEventListener('mousemove', (e) => this.canvasHover(e, board), false)
      this.drawings.drawGame(board.cells)
      this.gameId = gameId
    }

    changeBlockSize(newSize: number, board: Board){
      this.block_size = newSize
      this.drawings.blockSize = this.block_size
      this.ctx.canvas.width = COLS * this.block_size
      this.ctx.canvas.height = ROWS * this.block_size
      this.drawings.drawGame(board.cells)
    }

    getLaserPathAnimation(board: Board, from: Coordinates, to: Coordinates){
      return this.animations.laserAnimation(board, from, to)
    }

    private async canvasOnclick(event: MouseEvent, board: Board) {

      if(!this.interactable)
        return

      const coor = this.getMousePos(event)
      const selectedCell = board.getSelectableCellByCoordinates(coor.x, coor.y, this.currentPlayer)

      this.interactable = false

      if(board.selectedCell){
        if(selectedCell){
          this.gameService.movePiece(this.gameId, board.selectedCell.coordinates, selectedCell.coordinates)
          await this.makeAMoveEvent(selectedCell.coordinates, board)
          this.gameService.increaseAnimationEvents()
          board.movePiece(board.selectedCell.coordinates, selectedCell.coordinates)
          this.gameService.setLocalGameState(board.serialize())
          this.drawings.drawGame(board.cells)
          board.currentTurn++
          this.eventEmitter.invokeRefresh()

        }
        this.unselectCellEvent(board)

      }
      else {
        if(selectedCell){
          this.selectCellEvent(selectedCell, board)
          if(selectedCell.piece?.piece_type == PieceType.LASER)
            this.drawings.drawLaserButton()
        }
      }

      const myTurn = board.isMyTurn()
      this.interactable = myTurn

    }

    private canvasHover(event: MouseEvent, board: Board) {
      if(board.selectedCell && this.interactable){
        const coor = this.getMousePos(event)
        const hoveredOver = board.getCellByCoordinates(coor.x, coor.y)
        if(hoveredOver && hoveredOver != this.hoveredCell){
          if(board.selectedCell.possibleMoves(board)?.includes(hoveredOver)){
            this.drawings.drawSingleCell(hoveredOver)
            this.drawings.highlightCell(hoveredOver, this.highlightColor)
          }
          else {
            if(this.hoveredCell && board.selectedCell.possibleMoves(board)?.includes(this.hoveredCell)){
              this.drawings.drawSingleCell(this.hoveredCell)
              this.drawings.showPossibleMove(this.hoveredCell, this.highlightColor)
            }
          }
          this.hoveredCell = hoveredOver
        }
      }
    }

    async rotationButtonPressed(board: Board){
      const selectedCell = board.selectedCell

      if(selectedCell && this.interactable){
        this.gameService.rotatePiece(this.gameId,selectedCell.coordinates, 90)
        this.interactable = false
        await this.animations.rotatePiece(board, selectedCell, 90)
        this.gameService.increaseAnimationEvents()
        this.unselectCellEvent(board)
        board.currentTurn++

        this.eventEmitter.invokeRefresh()
      }
    }

    laserButtonPressed(board: Board){
      console.log("LazorShoot2")
      const laserCell = board.getMyLaser()
      if(laserCell && this.interactable){
        this.interactable = false
        board.currentTurn++
        console.log("Sending request")
        this.gameService.shootLaser(this.gameId).then(res => {
          console.log("Request received! Invoking refresh")
          this.eventEmitter.invokeRefresh()
        })
      }
      else
        alert("You dont have a laser!")
    }

    private selectCellEvent(selectedCell: Cell, board: Board){
      board.selectCell(selectedCell)
      this.drawings.highlightCell(selectedCell, this.highlightColor)
      selectedCell.piece?.getPossibleMoves(board, selectedCell).forEach(c => this.drawings.showPossibleMove(c, this.highlightColor))
    }

    private unselectCellEvent(board: Board){
      board.unselectCell()
      this.drawings.drawGame(board.cells)
    }

    private makeAMoveEvent(coor: Coordinates, board: Board): Promise<void>{
      return this.animations.movePiece(board, board.selectedCell!.coordinates, coor)
    }

    private getMousePos(event: MouseEvent){
        const rect = this.ctx.canvas.getBoundingClientRect();
        return {
          x: Math.floor((event.clientX - rect.left) / this.block_size),
          y: 8 - Math.floor((event.clientY - rect.top) / this.block_size)
        }
    }

}

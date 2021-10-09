import { Injectable } from "@angular/core"
import { Coordinates } from "../../game.models"
import { GameService } from "../../game.service"
import { Board } from "../board"
import { Cell } from "../cell"
import { COLS, ROWS } from "../constants"
import { Animations } from "./Animations"
import { Drawings } from "./Drawings"

@Injectable()
export class Canvas {

    ctx!: CanvasRenderingContext2D
    animations!: Animations
    drawings!: Drawings
    interactable: boolean = true
    block_size!: number
    highlightColor: string = "yellow"
    hoveredCell: Cell | undefined
    gameId!: string

    constructor(private gameService: GameService) {}

    initCanvas(ctx: CanvasRenderingContext2D, board: Board, size: number, gameId: string){
        this.block_size = size
        this.ctx = ctx
        this.ctx.canvas.width = COLS * this.block_size
        this.ctx.canvas.height = ROWS * this.block_size
        this.drawings = new Drawings(ctx, this.block_size)
        this.animations = new Animations(this.drawings)
        this.ctx.canvas.addEventListener('click', (e) => this.canvasOnclick(e, board), false)
        this.ctx.canvas.addEventListener('mousemove', (e) => this.canvasHover(e, board), false)
        this.drawings.initBoard(board)
        this.gameId = gameId
    }

    changeBlockSize(newSize: number, board: Board){
      this.block_size = newSize
      this.drawings.blockSize = this.block_size
      this.ctx.canvas.width = COLS * this.block_size
      this.ctx.canvas.height = ROWS * this.block_size
      this.drawings.drawGame(board, board.cells)
    }

    private async canvasOnclick(event: MouseEvent, board: Board) {

      if(!this.interactable)
        return

      const coor = this.getMousePos(event)
      const selectedCell = board.getSelectableCellByCoordinates(coor.x, coor.y, "1")

      this.interactable = false

      if(board.selectedCell){
        if(selectedCell){
          await this.makeAMoveEvent(coor, board)
          board.movePiece(board.selectedCell, selectedCell)
        }
        this.unselectCellEvent(board)
      }
      else {
        if(selectedCell)
          this.selectCellEvent(selectedCell, board)
      }

      this.interactable = true

    }

    private async canvasHover(event: MouseEvent, board: Board) {
      if(board.selectedCell){
        const coor = this.getMousePos(event)
        const hoveredOver = board.getCellByCoordinates(coor.x, coor.y)
        if(hoveredOver && hoveredOver != this.hoveredCell){
          if(board.selectedCell.possibleMoves(board)?.includes(hoveredOver))
            this.drawings.highlightCell(hoveredOver, this.highlightColor)
          else {
            this.drawings.drawGame(board, board.cells) // kinda lazy but works, change it on "draw single cell"
            this.selectCellEvent(board.selectedCell, board)
          }
          this.hoveredCell = hoveredOver
        }
      }
    }

    async rotationButtonPressed(board: Board){
      const selectedCell = board.selectedCell

      if(selectedCell){
        this.interactable = false
        await this.animations.rotatePiece(board, selectedCell, 90)
        this.unselectCellEvent(board)
        this.interactable = true
      }

    }

    private selectCellEvent(selectedCell: Cell, board: Board){
      board.selectCell(selectedCell)
      this.drawings.highlightCell(selectedCell, this.highlightColor)
      selectedCell.piece?.getPossibleMoves(board, selectedCell).forEach(c => this.drawings.showPossibleMove(c, this.highlightColor))
    }

    private unselectCellEvent(board: Board){
      board.unselectCell()
      this.drawings.drawGame(board, board.cells)
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

import { Board } from "../../board"
import { COLS, ROWS } from "../../constants"
import { Drawings } from "../Drawings"
import { Resources } from "../Resources"

export abstract class Canvas {

  interactable: boolean = false

  constructor(public ctx: CanvasRenderingContext2D, public blockSize: number, public drawings: Drawings, public resources: Resources, protected gameId: string) {
      this.ctx.canvas.width = COLS * this.blockSize
      this.ctx.canvas.height = ROWS * this.blockSize
  }

  changeBlockSize(newSize: number, board: Board){
    this.blockSize = newSize
    this.ctx.canvas.width = COLS * this.blockSize
    this.ctx.canvas.height = ROWS * this.blockSize
    this.drawings.drawGame(this, board.cells)
  }

}

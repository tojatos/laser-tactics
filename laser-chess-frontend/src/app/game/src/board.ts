import { BoardInterface, GameState } from "../game.models"
import { Cell } from "./Cell"
import { COLS, ROWS, BLOCK_SIZE } from "./constants"

export class Board implements BoardInterface {

  ctx: CanvasRenderingContext2D
  cells: Cell[] = []

  constructor(context: CanvasRenderingContext2D){
    this.ctx = context
  }

  initBoard(gameState: GameState) {
    this.ctx.canvas.width = COLS * BLOCK_SIZE
    this.ctx.canvas.height = ROWS * BLOCK_SIZE
    const board_img = new Image()
    board_img.src = 'assets/board.jpg'
    board_img.onload = () => {
      this.ctx.drawImage(board_img, 0, 0);
      gameState.board.cells.forEach(c => this.cells.push(new Cell(c.coordinates, c.piece, this.ctx)))
    }
  }

  getCellByCoordinates(x: number, y: number): Cell | undefined {
    return this.cells.find(c => c.coordinates == {x: x, y: y}) 
  }

}

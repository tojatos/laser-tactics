import { BoardInterface, GameState } from "../game.models"
import { Cell } from "./cell"

export class Board implements BoardInterface {

  cells: Cell[] = []
  board_img = new Image()
  selectedCell: Cell | undefined

  constructor(){
    this.board_img.src = 'assets/board.jpg'
  }

  initBoard(gameState: GameState) {
      gameState.board.cells.forEach(c => this.cells.push(new Cell(c.coordinates, c.piece)) )
  }

  selectCell(cell: Cell | undefined) {
    if(cell && this.cells.includes(cell) && cell.piece)
      this.selectedCell = cell
  }

  getCellByCoordinates(x: number, y: number): Cell | undefined {
    return this.cells.find(c => c.coordinates.x == x && c.coordinates.y == y)
  }

  getSelectableCellByCoordinates(x: number, y: number, owner: string): Cell | undefined {
    if(this.selectedCell)
      return this.selectedCell.piece?.getPossibleMoves(this, this.selectedCell).find(c => c.coordinates.x == x && c.coordinates.y == y)
    return this.cells.find(c => c.coordinates.x == x && c.coordinates.y == y && c.piece?.piece_owner == owner)
  }

}
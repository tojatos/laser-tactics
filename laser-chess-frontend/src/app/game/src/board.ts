import { BoardInterface, GameState } from "../game.models"
import { Cell } from "./Cell"
import { PieceType } from "./PieceType"

export class Board implements BoardInterface {

  cells: Cell[] = []
  board_img = new Image()

  constructor(){
    this.board_img.src = 'assets/board.jpg'
  }

  initBoard(gameState: GameState) {
      gameState.board.cells.forEach(c => this.cells.push(new Cell(c.coordinates, c.piece)) )
  }

  getCellByCoordinates(x: number, y: number): Cell | undefined {
    return this.cells.find(c => c.coordinates.x == x && c.coordinates.y == y) 
  }

  getSelectableCellByCoordinates(x: number, y: number, owner: string): Cell | undefined {
    
    return this.cells.find(c => c.coordinates.x == x && c.coordinates.y == y && c.piece?.piece_owner == owner) 
  }

}

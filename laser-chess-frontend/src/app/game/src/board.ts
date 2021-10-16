import { Injectable } from "@angular/core"
import { BoardInterface, Coordinates, GameState } from "../game.models"
import { Resources } from "./Canvas/Resources"
import { Cell } from "./cell"
import { PieceType } from "./enums"

@Injectable()
export class Board implements BoardInterface {

  cells: Cell[] = []
  selectedCell: Cell | undefined
  boardStorageId: string

  constructor(){
    this.boardStorageId = 'game'
  }

  initBoard(gameState: GameState, blockSize: number) {
    gameState.board.cells.forEach(c => this.cells.push(new Cell(c.coordinates, c.piece, blockSize)) )
  }

  fetchBoardState(gameState: GameState, blockSize: number){
    gameState.board.cells.forEach(c => this.cells.push(new Cell(c.coordinates, c.piece, blockSize)) )
  }

  selectCell(cell: Cell | undefined) {
    if(cell && this.cells.includes(cell) && cell.piece)
      this.selectedCell = cell
  }

  unselectCell(){
    this.selectedCell = undefined
  }

  getCellByCoordinates(x: number, y: number): Cell | undefined {
    return this.cells.find(c => c.coordinates.x == x && c.coordinates.y == y)
  }

  getSelectableCellByCoordinates(x: number, y: number, owner: string): Cell | undefined {
    if(!this.selectedCell)
      //return this.cells.find(c => c.coordinates.x == x && c.coordinates.y == y && c.piece?.piece_owner == owner)
      return this.cells.find(c => c.coordinates.x == x && c.coordinates.y == y)
    return this.selectedCell.piece?.getPossibleMoves(this, this.selectedCell).find(c => c.coordinates.x == x && c.coordinates.y == y)
  }

  movePiece(originCell: Cell, destinationCell: Cell){
    if(originCell.piece){
      destinationCell.acceptNewPiece(originCell.piece)
      originCell.piece = null
    }
  }

  rotatePiece(at: Coordinates, angle: number){
    const cell = this.cells.find(c => c.coordinates == at)
    if(cell?.piece)
      cell.piece.rotation_degree = angle
  }

  changeCellCoordinates(newSize: number){
    this.cells.forEach(c => c.changeCanvasCoordinates(newSize))
  }

  saveBoardState(){
    localStorage.setItem(this.boardStorageId, JSON.stringify(this))
  }

  getLaserCell(player: string){
    //return this.cells.find(c => c.piece?.piece_type == PieceType.LASER && c.piece.piece_owner == player)
    return this.cells.find(c => c.piece?.piece_type == PieceType.LASER && c.piece.piece_owner == player)
  }

}

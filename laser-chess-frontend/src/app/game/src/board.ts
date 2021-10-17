import { Injectable } from "@angular/core"
import { BoardInterface, Coordinates, GameEvent, GameState, PieceMovedEvent } from "../game.models"
import { Cell } from "./cell"
import { PieceType, PlayerType } from "./enums"

@Injectable()
export class Board implements BoardInterface {

  cells: Cell[] = []
  selectedCell: Cell | undefined
  currentTurn = 0
  playerOne: string | undefined
  playerTwo: string | undefined

  constructor(){}

  initBoard(gameState: GameState, blockSize: number) {
    this.cells = []
    this.currentTurn = gameState.turn_number
    this.playerOne = gameState.player_one_id
    this.playerTwo = gameState.player_two_id
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
      return this.cells.find(c => c.coordinates.x == x && c.coordinates.y == y && c.piece?.piece_owner == this.parsePlayerIdToPlayerNumber(owner))
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

  getLaserCell(player: string){
    return this.cells.find(c => c.piece?.piece_type == PieceType.LASER && c.piece.piece_owner == player)
  }

  executeEvent(gameEvent: GameEvent){
    if(this.isMove(gameEvent))
      this.movePiece(this.getCellByCoordinates(gameEvent.moved_from.x, gameEvent.moved_from.y)!, this.getCellByCoordinates(gameEvent.moved_to.x, gameEvent.moved_to.y)!)
  }

  isMove(object: any): object is PieceMovedEvent {
  return 'moved_from' in object;
  }


  isMyTurn(player: string | null) {
    const turnOfPlayer = Math.round(this.currentTurn / 2) % 2 == 0 ? this.playerTwo : this.playerOne
    return player != null && turnOfPlayer != null && player == turnOfPlayer
  }

  parsePlayerIdToPlayerNumber(playerId: string){

    if(playerId == this.playerOne)
      return PlayerType.PLAYER_ONE
    else if (playerId == this.playerTwo)
      return PlayerType.PLAYER_TWO

    return undefined
  }

}

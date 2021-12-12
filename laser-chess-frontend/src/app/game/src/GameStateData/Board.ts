import { Injectable } from "@angular/core"
import { AuthService } from "src/app/auth/auth.service"
import { BoardInterface, Coordinates, GameEvent, GameState } from "../../game.models"
import { Cell } from "./Cell"
import { GameEvents, PieceType, PlayerType } from "../Utils/Enums"

@Injectable()
export class Board implements BoardInterface {

  cells: Cell[] = []
  selectedCell: Cell | undefined
  currentTurn = 0
  playerOne: string | undefined
  playerTwo: string | undefined
  gameId: string | undefined
  blockSize: number | undefined

  constructor(private authService: AuthService){}

  initBoard(gameState: GameState, blockSize: number): void {
    this.blockSize = blockSize
    this.gameId = gameState.game_id
    this.cells = []
    this.currentTurn = gameState.turn_number
    this.playerOne = gameState.player_one_id
    this.playerTwo = gameState.player_two_id
    gameState.board.cells.forEach(c => this.cells.push(new Cell(c.coordinates, c.piece, c.auxiliaryPiece, blockSize)) )
  }

  selectCell(cell: Cell | undefined): void  {
    if(cell && this.cells.includes(cell) && cell.piece)
      this.selectedCell = cell
  }

  unselectCell(): void {
    this.selectedCell = undefined
  }

  getCellByCoordinates(x: number, y: number): Cell | undefined {
    return this.cells.find(c => c.coordinates.x == x && c.coordinates.y == y)
  }

  getSelectableCellByCoordinates(x: number, y: number, owner: string | undefined): Cell | undefined {
    if(!this.selectedCell)
      return this.cells.find(c => c.coordinates.x == x && c.coordinates.y == y && c.piece?.piece_owner == this.parsePlayerIdToPlayerNumber(owner))
    return this.selectedCell.piece?.getPossibleMoves(this, this.selectedCell).find(c => c?.coordinates.x == x && c.coordinates.y == y)
  }

    movePiece(origin: Coordinates, destination: Coordinates): void {
    const originCell = this.getCellByCoordinates(origin.x, origin.y)
    const destinationCell = this.getCellByCoordinates(destination.x, destination.y)
    if(originCell && destinationCell && originCell.piece){

      if((originCell.piece.piece_type == PieceType.HYPER_SQUARE || originCell.piece.piece_type == PieceType.HYPER_CUBE) && originCell.auxiliaryPiece){
        destinationCell.acceptNewPiece(originCell.auxiliaryPiece)
        originCell.auxiliaryPiece = null
      }
      else{
        destinationCell.acceptNewPiece(originCell.piece)
        originCell.piece = originCell.auxiliaryPiece
      }

    }
  }

  rotatePiece(at: Coordinates, angle: number): void {
    const cell = this.getCellByCoordinates(at.x, at.y)
    if(cell?.piece){
      const newDegree = (cell.piece.rotation_degree + angle) % 360
      cell.piece.rotation_degree = newDegree
    }
  }


  changeCellCoordinates(newSize: number): void {
    this.cells.forEach(c => c.changeCanvasCoordinates(newSize))
  }

  getMyLaser(): Cell | undefined {
    const player = this.authService.getCurrentJwtInfo()?.sub
    return this.cells.find(c => c.piece?.piece_type == PieceType.LASER && c.piece.piece_owner == this.parsePlayerIdToPlayerNumber(player))
  }

  getLaserCell(): Cell | undefined{
    const player = this.authService.getCurrentJwtInfo()?.sub
    if(this.isMyTurn())
      return this.cells.find(c => c.piece?.piece_type == PieceType.LASER && c.piece.piece_owner == this.parsePlayerIdToPlayerNumber(player))
    return this.cells.find(c => c.piece?.piece_type == PieceType.LASER && c.piece.piece_owner != this.parsePlayerIdToPlayerNumber(player))
  }

  executeEvent(gameEvent: GameEvent): void{
    switch(gameEvent.event_type){
      case GameEvents.PIECE_ROTATED_EVENT : this.rotatePiece(gameEvent.rotated_piece_at, gameEvent.rotation); break
      case GameEvents.PIECE_MOVED_EVENT : this.movePiece(gameEvent.moved_from, gameEvent.moved_to); break
      case GameEvents.TELEPORT_EVENT : this.movePiece(gameEvent.teleported_from, gameEvent.teleported_to); break
      case GameEvents.PIECE_DESTROYED_EVENT : this.removePiece(gameEvent.destroyed_on); break
    }
  }

  get turnOfPlayer(): PlayerType {
    const turnOfPlayer = Math.round(this.currentTurn / 2) % 2 == 0 ? this.playerTwo : this.playerOne
    return this.parsePlayerIdToPlayerNumber(turnOfPlayer)
  }

  get playerNum(): PlayerType {
    const player = this.authService.getCurrentJwtInfo()?.sub

    if(player == this.playerOne)
      return PlayerType.PLAYER_ONE

    else if(player == this.playerTwo)
      return PlayerType.PLAYER_TWO

    return PlayerType.NONE
  }

  isPlayer(username: string): boolean {
    return this.playerOne == username || this.playerTwo == username
  }

  isMyTurn(): boolean {
    const player = this.authService.getCurrentJwtInfo()?.sub
    const turnOfPlayer = Math.round(this.currentTurn / 2) % 2 == 0 ? this.playerTwo : this.playerOne
    return player != undefined && turnOfPlayer != undefined && player == turnOfPlayer
  }

  parsePlayerIdToPlayerNumber(playerId: string | undefined): PlayerType{

    if(playerId == this.playerOne)
      return PlayerType.PLAYER_ONE
    else if (playerId == this.playerTwo)
      return PlayerType.PLAYER_TWO

    return PlayerType.NONE
  }

  setInitialGameState(initialGameState: GameState, blockSize: number): void{
    this.setGameState(initialGameState, blockSize)
  }

  setGameState(gameState: GameState, blockSize: number): void{
    if(this.blockSize)
      this.initBoard(gameState, blockSize)
  }

  removePiece(at: Coordinates): void {
    const cell = this.getCellByCoordinates(at.x, at.y)
    if(cell?.piece)
      cell.piece = null
  }

}

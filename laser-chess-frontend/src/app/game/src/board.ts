import { Injectable } from "@angular/core"
import { AuthService } from "src/app/auth/auth.service"
import { BoardInterface, CellInterface, Coordinates, GameEvent, GameState, PieceInterface, PieceMovedEvent } from "../game.models"
import { Cell } from "./cell"
import { GameEvents, GamePhase, PieceType, PlayerType } from "./enums"

const initialGameState: GameState = JSON.parse(`{
  "player_one_id": "string",
  "player_two_id": "string2",
  "board": {
    "cells": [
      {
        "coordinates": {
          "x": 0,
          "y": 0
        },
        "piece": {
          "piece_type": "TRIANGULAR_MIRROR",
          "piece_owner": "PLAYER_ONE",
          "rotation_degree": 0
        }
      },
      {
        "coordinates": {
          "x": 1,
          "y": 0
        },
        "piece": {
          "piece_type": "TRIANGULAR_MIRROR",
          "piece_owner": "PLAYER_ONE",
          "rotation_degree": 0
        }
      },
      {
        "coordinates": {
          "x": 2,
          "y": 0
        },
        "piece": {
          "piece_type": "DIAGONAL_MIRROR",
          "piece_owner": "PLAYER_ONE",
          "rotation_degree": 0
        }
      },
      {
        "coordinates": {
          "x": 3,
          "y": 0
        },
        "piece": {
          "piece_type": "HYPER_CUBE",
          "piece_owner": "PLAYER_ONE",
          "rotation_degree": 0
        }
      },
      {
        "coordinates": {
          "x": 4,
          "y": 0
        },
        "piece": {
          "piece_type": "KING",
          "piece_owner": "PLAYER_ONE",
          "rotation_degree": 0
        }
      },
      {
        "coordinates": {
          "x": 5,
          "y": 0
        },
        "piece": {
          "piece_type": "LASER",
          "piece_owner": "PLAYER_ONE",
          "rotation_degree": 0
        }
      },
      {
        "coordinates": {
          "x": 6,
          "y": 0
        },
        "piece": {
          "piece_type": "DIAGONAL_MIRROR",
          "piece_owner": "PLAYER_ONE",
          "rotation_degree": 90
        }
      },
      {
        "coordinates": {
          "x": 7,
          "y": 0
        },
        "piece": {
          "piece_type": "TRIANGULAR_MIRROR",
          "piece_owner": "PLAYER_ONE",
          "rotation_degree": 270
        }
      },
      {
        "coordinates": {
          "x": 8,
          "y": 0
        },
        "piece": {
          "piece_type": "TRIANGULAR_MIRROR",
          "piece_owner": "PLAYER_ONE",
          "rotation_degree": 270
        }
      },
      {
        "coordinates": {
          "x": 0,
          "y": 1
        },
        "piece": {
          "piece_type": "TRIANGULAR_MIRROR",
          "piece_owner": "PLAYER_ONE",
          "rotation_degree": 270
        }
      },
      {
        "coordinates": {
          "x": 1,
          "y": 1
        },
        "piece": {
          "piece_type": "BLOCK",
          "piece_owner": "PLAYER_ONE",
          "rotation_degree": 0
        }
      },
      {
        "coordinates": {
          "x": 2,
          "y": 1
        },
        "piece": {
          "piece_type": "BLOCK",
          "piece_owner": "PLAYER_ONE",
          "rotation_degree": 0
        }
      },
      {
        "coordinates": {
          "x": 3,
          "y": 1
        },
        "piece": {
          "piece_type": "MIRROR",
          "piece_owner": "PLAYER_ONE",
          "rotation_degree": 90
        }
      },
      {
        "coordinates": {
          "x": 4,
          "y": 1
        },
        "piece": {
          "piece_type": "MIRROR",
          "piece_owner": "PLAYER_ONE",
          "rotation_degree": 0
        }
      },
      {
        "coordinates": {
          "x": 5,
          "y": 1
        },
        "piece": {
          "piece_type": "BEAM_SPLITTER",
          "piece_owner": "PLAYER_ONE",
          "rotation_degree": 0
        }
      },
      {
        "coordinates": {
          "x": 6,
          "y": 1
        },
        "piece": {
          "piece_type": "BLOCK",
          "piece_owner": "PLAYER_ONE",
          "rotation_degree": 0
        }
      },
      {
        "coordinates": {
          "x": 7,
          "y": 1
        },
        "piece": {
          "piece_type": "BLOCK",
          "piece_owner": "PLAYER_ONE",
          "rotation_degree": 0
        }
      },
      {
        "coordinates": {
          "x": 8,
          "y": 1
        },
        "piece": {
          "piece_type": "TRIANGULAR_MIRROR",
          "piece_owner": "PLAYER_ONE",
          "rotation_degree": 0
        }
      },
      {
        "coordinates": {
          "x": 0,
          "y": 2
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 1,
          "y": 2
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 2,
          "y": 2
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 3,
          "y": 2
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 4,
          "y": 2
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 5,
          "y": 2
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 6,
          "y": 2
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 7,
          "y": 2
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 8,
          "y": 2
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 0,
          "y": 3
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 1,
          "y": 3
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 2,
          "y": 3
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 3,
          "y": 3
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 4,
          "y": 3
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 5,
          "y": 3
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 6,
          "y": 3
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 7,
          "y": 3
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 8,
          "y": 3
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 0,
          "y": 4
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 1,
          "y": 4
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 2,
          "y": 4
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 3,
          "y": 4
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 4,
          "y": 4
        },
        "piece": {
          "piece_type": "HYPER_SQUARE",
          "piece_owner": "NONE",
          "rotation_degree": 0
        }
      },
      {
        "coordinates": {
          "x": 5,
          "y": 4
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 6,
          "y": 4
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 7,
          "y": 4
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 8,
          "y": 4
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 0,
          "y": 5
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 1,
          "y": 5
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 2,
          "y": 5
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 3,
          "y": 5
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 4,
          "y": 5
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 5,
          "y": 5
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 6,
          "y": 5
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 7,
          "y": 5
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 8,
          "y": 5
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 0,
          "y": 6
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 1,
          "y": 6
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 2,
          "y": 6
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 3,
          "y": 6
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 4,
          "y": 6
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 5,
          "y": 6
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 6,
          "y": 6
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 7,
          "y": 6
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 8,
          "y": 6
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 0,
          "y": 7
        },
        "piece": {
          "piece_type": "TRIANGULAR_MIRROR",
          "piece_owner": "PLAYER_TWO",
          "rotation_degree": 180
        }
      },
      {
        "coordinates": {
          "x": 1,
          "y": 7
        },
        "piece": {
          "piece_type": "BLOCK",
          "piece_owner": "PLAYER_TWO",
          "rotation_degree": 180
        }
      },
      {
        "coordinates": {
          "x": 2,
          "y": 7
        },
        "piece": {
          "piece_type": "BLOCK",
          "piece_owner": "PLAYER_TWO",
          "rotation_degree": 180
        }
      },
      {
        "coordinates": {
          "x": 3,
          "y": 7
        },
        "piece": {
          "piece_type": "BEAM_SPLITTER",
          "piece_owner": "PLAYER_TWO",
          "rotation_degree": 180
        }
      },
      {
        "coordinates": {
          "x": 4,
          "y": 7
        },
        "piece": {
          "piece_type": "MIRROR",
          "piece_owner": "PLAYER_TWO",
          "rotation_degree": 0
        }
      },
      {
        "coordinates": {
          "x": 5,
          "y": 7
        },
        "piece": {
          "piece_type": "MIRROR",
          "piece_owner": "PLAYER_TWO",
          "rotation_degree": 90
        }
      },
      {
        "coordinates": {
          "x": 6,
          "y": 7
        },
        "piece": {
          "piece_type": "BLOCK",
          "piece_owner": "PLAYER_TWO",
          "rotation_degree": 180
        }
      },
      {
        "coordinates": {
          "x": 7,
          "y": 7
        },
        "piece": {
          "piece_type": "BLOCK",
          "piece_owner": "PLAYER_TWO",
          "rotation_degree": 180
        }
      },
      {
        "coordinates": {
          "x": 8,
          "y": 7
        },
        "piece": {
          "piece_type": "TRIANGULAR_MIRROR",
          "piece_owner": "PLAYER_TWO",
          "rotation_degree": 90
        }
      },
      {
        "coordinates": {
          "x": 0,
          "y": 8
        },
        "piece": {
          "piece_type": "TRIANGULAR_MIRROR",
          "piece_owner": "PLAYER_TWO",
          "rotation_degree": 90
        }
      },
      {
        "coordinates": {
          "x": 1,
          "y": 8
        },
        "piece": {
          "piece_type": "TRIANGULAR_MIRROR",
          "piece_owner": "PLAYER_TWO",
          "rotation_degree": 90
        }
      },
      {
        "coordinates": {
          "x": 2,
          "y": 8
        },
        "piece": {
          "piece_type": "DIAGONAL_MIRROR",
          "piece_owner": "PLAYER_TWO",
          "rotation_degree": 90
        }
      },
      {
        "coordinates": {
          "x": 3,
          "y": 8
        },
        "piece": {
          "piece_type": "LASER",
          "piece_owner": "PLAYER_TWO",
          "rotation_degree": 180
        }
      },
      {
        "coordinates": {
          "x": 4,
          "y": 8
        },
        "piece": {
          "piece_type": "KING",
          "piece_owner": "PLAYER_TWO",
          "rotation_degree": 0
        }
      },
      {
        "coordinates": {
          "x": 5,
          "y": 8
        },
        "piece": {
          "piece_type": "HYPER_CUBE",
          "piece_owner": "PLAYER_TWO",
          "rotation_degree": 0
        }
      },
      {
        "coordinates": {
          "x": 6,
          "y": 8
        },
        "piece": {
          "piece_type": "DIAGONAL_MIRROR",
          "piece_owner": "PLAYER_TWO",
          "rotation_degree": 0
        }
      },
      {
        "coordinates": {
          "x": 7,
          "y": 8
        },
        "piece": {
          "piece_type": "TRIANGULAR_MIRROR",
          "piece_owner": "PLAYER_TWO",
          "rotation_degree": 180
        }
      },
      {
        "coordinates": {
          "x": 8,
          "y": 8
        },
        "piece": {
          "piece_type": "TRIANGULAR_MIRROR",
          "piece_owner": "PLAYER_TWO",
          "rotation_degree": 180
        }
      }
    ]
  },
  "game_phase": "STARTED",
  "turn_number": 1,
  "game_events": [],
  "user_events": []
}`)

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

  initBoard(gameState: GameState, blockSize: number) {
    this.blockSize = blockSize
    this.gameId = gameState.game_id
    this.cells = []
    this.currentTurn = gameState.turn_number
    this.playerOne = gameState.player_one_id
    this.playerTwo = gameState.player_two_id
    gameState.board.cells.forEach(c => this.cells.push(new Cell(c.coordinates, c.piece, c.auxiliaryPiece, blockSize)) )
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

  getSelectableCellByCoordinates(x: number, y: number, owner: string | undefined): Cell | undefined {
    if(!this.selectedCell)
      return this.cells.find(c => c.coordinates.x == x && c.coordinates.y == y && c.piece?.piece_owner == this.parsePlayerIdToPlayerNumber(owner))
    return this.selectedCell.piece?.getPossibleMoves(this, this.selectedCell).find(c => c.coordinates.x == x && c.coordinates.y == y)
  }

    movePiece(origin: Coordinates, destination: Coordinates){
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

  rotatePiece(at: Coordinates, angle: number){
    const cell = this.getCellByCoordinates(at.x, at.y)
    if(cell?.piece){
      const newDegree = (cell.piece.rotation_degree + angle) % 360
      cell.piece.rotation_degree = newDegree
    }
  }


  changeCellCoordinates(newSize: number){
    this.cells.forEach(c => c.changeCanvasCoordinates(newSize))
  }

  getMyLaser(){
    const player = this.authService.getCurrentJwtInfo()?.sub
    return this.cells.find(c => c.piece?.piece_type == PieceType.LASER && c.piece.piece_owner == this.parsePlayerIdToPlayerNumber(player))
  }

  getLaserCell(){
    const player = this.authService.getCurrentJwtInfo()?.sub
    if(this.isMyTurn())
      return this.cells.find(c => c.piece?.piece_type == PieceType.LASER && c.piece.piece_owner == this.parsePlayerIdToPlayerNumber(player))
    return this.cells.find(c => c.piece?.piece_type == PieceType.LASER && c.piece.piece_owner != this.parsePlayerIdToPlayerNumber(player))
  }

  executeEvent(gameEvent: GameEvent){
    switch(gameEvent.event_type){
      case GameEvents.PIECE_ROTATED_EVENT : this.rotatePiece(gameEvent.rotated_piece_at, gameEvent.rotation); break
      case GameEvents.PIECE_MOVED_EVENT : this.movePiece(gameEvent.moved_from, gameEvent.moved_to); break
      case GameEvents.TELEPORT_EVENT : this.movePiece(gameEvent.teleported_from, gameEvent.teleported_to); break
      case GameEvents.PIECE_DESTROYED_EVENT : this.removePiece(gameEvent.destroyed_on); break
    }
  }

  get playerNum(){
    const player = this.authService.getCurrentJwtInfo()?.sub

    if(player == this.playerOne)
      return PlayerType.PLAYER_ONE

    else if(player == this.playerTwo)
      return PlayerType.PLAYER_TWO

    return PlayerType.NONE
  }

  get opponentNum(){
    const player = this.authService.getCurrentJwtInfo()?.sub

    if(player == this.playerOne)
      return PlayerType.PLAYER_TWO

    else if(player == this.playerTwo)
      return PlayerType.PLAYER_ONE

    return PlayerType.NONE
  }

  isMyTurn() {
    const player = this.authService.getCurrentJwtInfo()?.sub
    const turnOfPlayer = Math.round(this.currentTurn / 2) % 2 == 0 ? this.playerTwo : this.playerOne
    return player != undefined && turnOfPlayer != undefined && player == turnOfPlayer
  }

  parsePlayerIdToPlayerNumber(playerId: string | undefined){

    if(playerId == this.playerOne)
      return PlayerType.PLAYER_ONE
    else if (playerId == this.playerTwo)
      return PlayerType.PLAYER_TWO

    return undefined
  }

  setInitialGameState(blockSize: number){
    this.setGameState(initialGameState, blockSize)
  }

  setGameState(gameState: GameState, blockSize: number){
    if(this.blockSize)
      this.initBoard(gameState, blockSize)
  }

  serialize(): GameState{
    const boardInterface: BoardInterface = {cells: new Array<CellInterface>()}

    for (const cell of this.cells){
      const piece: PieceInterface | null = cell.piece?.serialize() || null
      const auxiliaryPiece: PieceInterface | null = cell.auxiliaryPiece?.serialize() || null
      boardInterface.cells.push({coordinates: cell.coordinates, piece: piece, auxiliaryPiece: auxiliaryPiece})
    }

    const gameStateSerialized: GameState = {
      game_id: this.gameId || "unknown",
      player_one_id: this.playerOne || PlayerType.NONE,
      player_two_id: this.playerTwo || PlayerType.NONE,
      board: boardInterface,
      game_phase: GamePhase.STARTED,
      turn_number: this.currentTurn,
      game_events: [],
      user_events: []
    }

    return gameStateSerialized

  }

  removePiece(at: Coordinates) {
    const cell = this.getCellByCoordinates(at.x, at.y)
    if(cell?.piece)
      cell.piece = null
  }

}

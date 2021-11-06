import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { gameStateFullEndpoint, movePieceFullEndpoint, rotatePieceFullEndpoint, shootLaserFullEndpoint } from 'src/app/api-definitions';
import { BoardInterface, Coordinates, GameState } from '../../game.models';
import { MovePieceRequest, RotatePieceRequest } from '../../game.request.models'
import { AbstractGameService } from './abstract-game-service';

@Injectable({
  providedIn: 'root'
})
export class GameService extends AbstractGameService {

  constructor(private http: HttpClient) { super(); }

  async getGameState(gameId: string): Promise<HttpResponse<GameState>> {
    const res = await this.http.post<GameState>(gameStateFullEndpoint, { "game_id": gameId }, { observe: 'response' }).toPromise()

    if(res.body)
      res.body.game_id = gameId

    return res

  }

  movePiece(gameId: string, from: Coordinates, to: Coordinates){

    const movePieceRequest: MovePieceRequest = {
      game_id: gameId,
      move_from: from,
      move_to: to
    }

    return this.http.post<void>(movePieceFullEndpoint, movePieceRequest).toPromise()
  }

  rotatePiece(gameId: string, at: Coordinates, angle: number){

    const rotatePieceRequest: RotatePieceRequest = {
      game_id: gameId,
      rotate_at: at,
      angle: angle
    }

    return this.http.post<void>(rotatePieceFullEndpoint, rotatePieceRequest).toPromise()
  }

  shootLaser(gameId: string){
    return this.http.post<void>(shootLaserFullEndpoint, { game_id: gameId }).toPromise()
  }

  increaseAnimationEvents(){
    const num = parseInt(localStorage.getItem("animationEvents") || "0") + 1
    localStorage.setItem("animationEvents", num.toString())
  }

  setAnimationEventsNum(num: number){
    localStorage.setItem("animationEvents", num.toString())
  }

  get numOfAnimationEvents(){
    return parseInt(localStorage.getItem("animationEvents") || "0")
  }

  animationsToShow(totalNumOfAnimations: number){
    return totalNumOfAnimations - this.numOfAnimationEvents
  }

  setLocalGameState(game: GameState){
    game.game_events = []
    localStorage.setItem("board", JSON.stringify(game))
  }

  getLocalGameState(): GameState | null{
    const board = localStorage.getItem("board")
    return board && JSON.parse(board)
  }

  get lastGameState(){

    const gameState = localStorage.getItem("board")
    if(gameState)
      return JSON.parse(gameState) as BoardInterface

    return undefined

  }
}

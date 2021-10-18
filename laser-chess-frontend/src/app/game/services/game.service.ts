import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BoardInterface, Coordinates, GameState } from '../game.models';
import { MovePieceRequest, RotatePieceRequest } from '../game.request.models'

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(private http: HttpClient) { }

  async getGameState(gameId: string): Promise<HttpResponse<GameState>> {
    const res = await this.http.post<GameState>('api/v1/get_game_state', { "game_id": gameId }, { observe: 'response' }).pipe(
      catchError(this.handleError)
    ).toPromise()

    localStorage.removeItem("board")
    localStorage.removeItem("gameEventsSize")

    if (res.body){
      localStorage.setItem("board", JSON.stringify(res.body.board))
      localStorage.setItem("gameEventsSize", JSON.stringify(res.body.game_events.length))
    }

    return res

  }

  async movePiece(gameId: string, from: Coordinates, to: Coordinates){

    const movePieceRequest: MovePieceRequest = {
      game_id: gameId,
      move_from: from,
      move_to: to
    }

    return this.http.post<void>('/api/v1/move_piece', movePieceRequest, { observe: 'response' }).pipe(
      catchError(this.handleError)
    ).toPromise()
  }

  async rotatePiece(gameId: string, at: Coordinates, angle: number){

    const rotatePieceRequest: RotatePieceRequest = {
      game_id: gameId,
      rotate_at: at,
      angle: angle
    }

    return this.http.post<void>('/api/v1/rotate_piece', rotatePieceRequest, { observe: 'response' }).pipe(
      catchError(this.handleError)
    ).toPromise()
  }

  async shootLaser(gameId: string){
    return this.http.post<void>('/api/v1/shoot_laser', { game_id: gameId }, { observe: 'response' }).pipe(
      catchError(this.handleError)
    ).toPromise()
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

  setGameState(game: BoardInterface){
    localStorage.setItem("board", JSON.stringify(game))
  }

  get lastGameState(){

    const gameState = localStorage.getItem("board")
    if(gameState)
      return JSON.parse(gameState) as BoardInterface

    return undefined

  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('An error occurred:', error.error);
    } else {
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    window.alert("ERROR!: " + error.error.detail) //define type of
    return throwError(error.error);
  }
}

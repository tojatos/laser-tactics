import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Coordinates, GameState } from './game.models';
import { MovePieceRequest, RotatePieceRequest } from './game.request.models'

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(private http: HttpClient) { }

  getGameState(gameId: string): Promise<HttpResponse<GameState>> {
    return this.http.post<GameState>('api/v1/get_game_state', {"game_id" : gameId }, {observe: 'response'}).pipe(
      catchError(this.handleError)
    ).toPromise()
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

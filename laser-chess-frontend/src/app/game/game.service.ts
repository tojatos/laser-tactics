import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GameState } from './game.models';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(private http: HttpClient) { }

  async getGameState(gameId: string): Promise<GameState> {
    return this.http.post<GameState>('http://localhost/get_game_state', gameId).toPromise()
  }
}

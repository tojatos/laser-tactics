import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { createLobbyFullEndpoint, leaveLobbyFullEndpoint, joinLobbyFullEndpoint, lobbyFullEndpoint, startGameFullEndpoint, updateLobbyFullEndpoint, joinRandomLobbyFullEndpoint } from '../api-definitions';
import { Lobby } from '../app.models';

@Injectable({
  providedIn: 'root'
})
export class LobbyService {

  constructor(private http: HttpClient) { }

  getLobbies() {
    return this.http.get<Lobby[]>(lobbyFullEndpoint()).toPromise()
  }

  getLobbyById(id: string){
    return this.http.get<Lobby>(lobbyFullEndpoint(id)).toPromise()
  }

  updateLobby(lobby: Lobby){
    return this.http.patch<Lobby>(updateLobbyFullEndpoint(), lobby).toPromise()
  }

  createLobby(){
    return this.http.post<Lobby>(createLobbyFullEndpoint(), {}).toPromise()
  }

  startGame(game_id: string, player_one_id: string, player_two_id: string, is_rated: boolean){
    return this.http.post<any>(startGameFullEndpoint, {'game_id': game_id, 'player_one_id': player_one_id, 'player_two_id': player_two_id, "is_rated": is_rated}).toPromise()
  }

  joinLobby(lobby_id: string){
    return this.http.patch<any>(joinLobbyFullEndpoint(), {game_id: lobby_id} ).toPromise()
  }

  leaveLobby(lobby_id: string){
    return this.http.patch<any>(leaveLobbyFullEndpoint(), {game_id: lobby_id}).toPromise()
  }

  joinRandom(rating_lower_bound: number, rating_higher_bound: number, is_rated: boolean){
    return this.http.post<any>(joinRandomLobbyFullEndpoint(), {'rating_lower_bound': rating_lower_bound, 'rating_higher_bound': rating_higher_bound, "is_rated": is_rated}).toPromise()
  }

}

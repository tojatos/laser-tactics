import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { createLobbyFullEndpoint, joinLobbyFullEndpoint, lobbyFullEndpoint, startGameFullEndpoint, updateLobbyFullEndpoint } from '../api-definitions';
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

  startGame(game_id: string, player_one_id: string, player_two_id: string){
    return this.http.post<any>(startGameFullEndpoint, {'game_id': game_id, 'player_one_id': player_one_id, 'player_two_id': player_two_id}).toPromise()
  }

  joinLobby(lobby_id: string){
    return this.http.patch<any>(joinLobbyFullEndpoint(), {game_id: lobby_id} ).toPromise()
  }

}

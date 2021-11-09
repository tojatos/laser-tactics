import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Lobby } from '../app.models';

@Injectable({
  providedIn: 'root'
})
export class LobbyService {

  constructor(private http: HttpClient) { }

  getLobbies() {
    return this.http.get<Lobby[]>('api/v1/lobby').toPromise()
  }

  getLobbyById(id: string){
    return this.http.get<Lobby>(`api/v1/lobby/${id}`).toPromise()
  }

  updateLobby(lobby: Lobby){
    return this.http.patch<Lobby>(`api/v1/lobby/update`, lobby).toPromise()
  }

  createLobby(){
    return this.http.post<Lobby>('api/v1/lobby/create', {}).toPromise()
  }

  startGame(game_id: string, player_one_id: string, player_two_id: string){
    return this.http.post<any>('api/v1/start_game', {'game_id': game_id, 'player_one_id': player_one_id, 'player_two_id': player_two_id}).toPromise()
  }

  joinLobby(lobby_id: string){
    return this.http.patch<any>('api/v1/lobby/join' + `?lobby_id=${lobby_id}`, {}).toPromise()
  }

}

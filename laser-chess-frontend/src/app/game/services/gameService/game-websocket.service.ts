import { Injectable } from '@angular/core';
import { webSocket } from "rxjs/webSocket";
import { AuthService } from 'src/app/auth/auth.service';
import { Coordinates } from '../../game.models';
import { MovePieceRequest, RotatePieceRequest } from '../../game.request.models';
import { AbstractGameService } from './abstract-game-service';

type websocketRequest = {
  request_path: string,
  request: any
}

@Injectable({
  providedIn: 'root'
})
export class GameWebsocketService extends AbstractGameService {

  constructor(private authService: AuthService){
    super()
    this.connect()
  }

  private subject = webSocket("ws://localhost/ws");

  private connect(){
    this.subject.asObservable().subscribe(
      msg => console.log(msg),
      err => console.log(err),
      () => console.log('Connection closed')
    )

    const token = this.authService.jwt
    if(token)
      this.sendRequest("/ws_auth", {token : token})

  }

  private sendRequest(path: string, request: any){
    const value: websocketRequest = { request_path: path, request: request}
    this.subject.next(value)
  }

  getGameState(gameId: string){
    const path = "/get_game_state"
    const request = { game_id: gameId }

    this.sendRequest(path, request)
  }

  movePiece(gameId: string, from: Coordinates, to: Coordinates){
    const path = "/move_piece"
    const movePieceRequest: MovePieceRequest = {
      game_id: gameId,
      move_from: from,
      move_to: to
    }

    this.sendRequest(path, movePieceRequest)
  }

  rotatePiece(gameId: string, at: Coordinates, angle: number) {
    const path = "/rotate_piece"
    const rotatePieceRequest: RotatePieceRequest = {
      game_id: gameId,
      rotate_at: at,
      angle: angle
    }

    this.sendRequest(path, rotatePieceRequest)
  }

  shootLaser(gameId: string) {
    const path = "/shoot_laser"
    const request = { game_id: gameId }

    this.sendRequest(path, request)
  }

}

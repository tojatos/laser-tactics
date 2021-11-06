import { Injectable } from '@angular/core';
import { webSocket } from "rxjs/webSocket";
import { authWebsocketEndpoint, gameStateEndpoint, movePieceEndpoint, rotatePieceEndpoint, shootLaserEndpoint } from 'src/app/api-definitions';
import { AuthService } from 'src/app/auth/auth.service';
import { environment } from 'src/environments/environment';
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

  private subject = webSocket(environment.WEBSOCKET_URL);

  private connect(){
    this.subject.asObservable().subscribe(
      msg => console.log(msg),
      err => console.log(err),
      () => console.log('Connection closed')
    )

    const token = this.authService.jwt
    if(token)
      this.sendRequest(authWebsocketEndpoint, {token : token})

  }

  private sendRequest(path: string, request: any){
    const value: websocketRequest = { request_path: path, request: request}
    this.subject.next(value)
  }

  getGameState(gameId: string){
    const request = { game_id: gameId }

    this.sendRequest(gameStateEndpoint, request)
  }

  movePiece(gameId: string, from: Coordinates, to: Coordinates){
    const movePieceRequest: MovePieceRequest = {
      game_id: gameId,
      move_from: from,
      move_to: to
    }

    this.sendRequest(movePieceEndpoint, movePieceRequest)
  }

  rotatePiece(gameId: string, at: Coordinates, angle: number) {
    const rotatePieceRequest: RotatePieceRequest = {
      game_id: gameId,
      rotate_at: at,
      angle: angle
    }

    this.sendRequest(rotatePieceEndpoint, rotatePieceRequest)
  }

  shootLaser(gameId: string) {
    const request = { game_id: gameId }

    this.sendRequest(shootLaserEndpoint, request)
  }

}

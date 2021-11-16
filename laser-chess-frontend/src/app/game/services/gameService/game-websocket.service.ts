import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { webSocket } from "rxjs/webSocket";
import { authWebsocketEndpoint, gameStateEndpoint, giveUpEndpoint, movePieceEndpoint, observeWebsocketEndpoint, offerDrawEndpoint, rotatePieceEndpoint, shootLaserEndpoint } from 'src/app/api-definitions';
import { AuthService } from 'src/app/auth/auth.service';
import { environment } from 'src/environments/environment';
import { Coordinates, GameState } from '../../game.models';
import { MovePieceRequest, RotatePieceRequest } from '../../game.request.models';
import { EventEmitterService } from '../event-emitter.service';
import { AbstractGameService } from './abstract-game-service';

type websocketRequest = {
  request_path: string,
  request: any
}

@Injectable({
  providedIn: 'root'
})
export class GameWebsocketService extends AbstractGameService {

  constructor(private authService: AuthService, private _snackBar: MatSnackBar, private eventEmitter: EventEmitterService){
    super()
  }

  private subject = webSocket<GameState | any>(environment.WEBSOCKET_URL);

  lastMessage: GameState | undefined = undefined

  connect(gameId: string){
    this.subject.asObservable().subscribe(
      msg => {
        console.log(msg)
        if(msg.status_code && msg.status_code != 200){
          console.log(msg.body)
          this.showSnackbar(msg.body)
          console.log(this.lastMessage)
          if(this.lastMessage)
            this.eventEmitter.invokeRollback(this.lastMessage)
          else
            window.location.reload()
        }
        else if((<GameState>msg).game_events){
          (<GameState>msg).game_id = gameId
          this.lastMessage = msg
          console.log(msg)
          this.eventEmitter.invokeRefresh(msg)
        }
      },
      err => {
        console.log(err)
        this.showSnackbar(err)
      },
      () => console.log('Connection closed')
    )

    this.sendRequest(observeWebsocketEndpoint, {game_id: gameId})

    const token = this.authService.jwt
    if(token)
      this.sendRequest(authWebsocketEndpoint, {token : token})

    this.getGameState(gameId)
  }

  private showSnackbar(message: string) {
    this._snackBar.open(message, "", {
      duration: 3000
    })
  }

  private sendRequest(path: string, request: any){
    const value: websocketRequest = { request_path: path, request: request}
    this.subject.next(value)
  }

  getGameState(gameId: string) {
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

  giveUp(gameId: string) {
    const request = { game_id: gameId }

    this.sendRequest(giveUpEndpoint, request)
  }

  offerDraw(gameId: string) {
    const request = { game_id: gameId }

    this.sendRequest(offerDrawEndpoint, request)
  }

  showDrawOffer(gameId: string){
    // const res = Swal.fire({
    //   title: "Draw offer",
    //   text: "Player offers draw",
    //   icon: 'question',
    //   showCancelButton: true
    // })
    // console.log(res)
    const res = window.confirm("draw?")
    if(res)
      this.offerDraw(gameId)
  }

  closeConnection(){
    this.subject.complete()
  }

}

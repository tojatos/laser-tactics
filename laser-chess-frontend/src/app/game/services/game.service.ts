import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { webSocket } from "rxjs/webSocket";
import { authWebsocketEndpoint, gameHistoryFullEndpoint, gameStateEndpoint, giveUpEndpoint, initalGameStateFullEndpoint, movePieceEndpoint, observeWebsocketEndpoint, offerDrawEndpoint, rotatePieceEndpoint, shootLaserEndpoint } from 'src/app/api-definitions';
import { AuthService } from 'src/app/auth/auth.service';
import { environment } from 'src/environments/environment';
import { Coordinates, GameState } from '../game.models';
import { MovePieceRequest, RotatePieceRequest } from '../game.request.models';
import { EventEmitterService } from './event-emitter.service';
import Swal from 'sweetalert2'
import { GamePhase } from '../src/enums';
import { HttpClient } from '@angular/common/http';
import { UserHistory } from 'src/app/app.models';

type websocketRequest = {
  request_path: string,
  request: any
}

@Injectable({
  providedIn: 'root'
})
export class GameWebsocketService {

  constructor(private authService: AuthService, private _snackBar: MatSnackBar, private eventEmitter: EventEmitterService, private http: HttpClient){}

  subject = webSocket<GameState | any>(environment.WEBSOCKET_URL)

  getSubject = () => this.subject

  lastMessage: GameState | undefined = undefined

  connect(gameId: string){
    this.getSubject().asObservable().subscribe(
      msg => {
        console.log(msg)
        if(msg.status_code && msg.status_code != 200){
          this.showSnackbar(msg.body)
          if(this.lastMessage)
            this.eventEmitter.invokeRollback(this.lastMessage)
        }
        else if((<GameState>msg).game_events){
          (<GameState>msg).game_id = gameId
          this.lastMessage = msg
          this.eventEmitter.invokeRefresh(msg)
        }
      },
      err => {
        console.error(err)
        this.showSnackbar("Connection error ocurred. Maybe there is no such game?")
      },
      () => this.showSnackbar("Connection to the server closed.")
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
    this.getSubject().next(value)
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
    if(this.lastMessage?.game_phase == GamePhase.STARTED)
      Swal.fire({
        title: "Draw offer",
        text: "Player offers draw",
        icon: 'question',
        showCancelButton: true
      }).then(res => {
        if(res.isConfirmed)
          this.offerDraw(gameId)
      })

  }

  closeConnection(){
    this.getSubject().complete()
  }

  getInitialGameState(): Promise<GameState>{
    return this.http.get<GameState>(initalGameStateFullEndpoint).toPromise()
  }

  getGameInfo(gameId: string): Promise<UserHistory> {
    return this.http.get<UserHistory>(gameHistoryFullEndpoint(gameId)).toPromise()
  }

  increaseAnimationEvents(){
    const num = parseInt(localStorage.getItem("animationEvents") || "0") + 1
    localStorage.setItem("animationEvents", num.toString())
  }

  setAnimationEventsNum(num: number){
    localStorage.setItem("animationEvents", num.toString())
  }

  numOfAnimationEvents(){
    return parseInt(localStorage.getItem("animationEvents") || "0")
  }

  animationsToShow(totalNumOfAnimations: number){
    return totalNumOfAnimations - this.numOfAnimationEvents()
  }
}

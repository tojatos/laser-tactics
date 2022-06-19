import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { webSocket } from "rxjs/webSocket";
import { authChatWebsocketEndpoint, getChatEndpoint, observeChatWebsocketEndpoint, sendChatMessageEndpoint } from 'src/app/api-definitions';
import { AuthService } from 'src/app/auth/auth.service';
import { environment } from 'src/environments/environment';
import { ChatMessage } from '../game.models';
import { EventEmitterService } from './event-emitter.service';

type websocketResponse = {
  status_code: number,
  body: string
}

type websocketRequest = {
  request_path: string,
  request: unknown
}

type ChatWrapper = {
  game_id: string,
  messages: Array<ChatMessage>
}

@Injectable({
  providedIn: 'root'
})
export class ChatWebsocketService {

  constructor(private authService: AuthService, private _snackBar: MatSnackBar, private eventEmitter: EventEmitterService){}

  subject = webSocket<unknown>(environment.CHAT_WEBSOCKET_URL)

  getSubject = () => this.subject

  lastMessages: Array<ChatMessage> = []

  connect(gameId: string){
    this.getSubject().asObservable().subscribe(
      msg => {
        if((<websocketResponse>msg).status_code && (<websocketResponse>msg).status_code != 200){
          this.showSnackbar((<websocketResponse>msg).body)
        }
        else if((<ChatWrapper>msg).messages){
          this.lastMessages = (<ChatWrapper>msg).messages
          this.eventEmitter.setChat(this.lastMessages)
        }
      },
      err => {
        console.error(err)
        this.showSnackbar("Connection error ocurred. Maybe there is no such game?")
      },
      () => this.showSnackbar("Connection to the game server closed.")
    )

    this.sendRequest(observeChatWebsocketEndpoint, {game_id: gameId})

    const token = this.authService.jwt
    if(token)
      this.sendRequest(authChatWebsocketEndpoint, {token : token})

    this.getChat(gameId)
  }

  private showSnackbar(message: string) {
    this._snackBar.open(message, "", {
      duration: 3000
    })
  }

  private sendRequest(path: string, request: unknown){
    const value: websocketRequest = { request_path: path, request: request}
    this.getSubject().next(value)
  }

  getChat(gameId: string): void {
    const request = { game_id: gameId }
    this.sendRequest(getChatEndpoint, request)
  }

  sendMessage(gameId: string, payload: string): void {
    const request = {
      game_id: gameId,
      payload: payload
    }
    console.log(payload)
    this.sendRequest(sendChatMessageEndpoint, request)
  }

  closeConnection(): void{
    this.subject.complete()
  }
}

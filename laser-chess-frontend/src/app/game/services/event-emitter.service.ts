import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ChatMessage, GameState } from '../game.models';

@Injectable({
  providedIn: 'root'
})
export class EventEmitterService {

  subsRefresh = new Subject()
  subsRollback = new Subject()
  subsChat = new Subject()
  subsSpectators = new Subject()

  invokeRefresh(gameState: GameState): void{
    this.subsRefresh.next(gameState)
  }

  invokeRollback(gameState: GameState): void{
    this.subsRollback.next(gameState)
  }

  setChat(messages: Array<ChatMessage>): void {
    this.subsChat.next(messages)
  }

  setSpectators(spectators: Array<string | null>): void {
    this.subsSpectators.next(spectators)
  }

}

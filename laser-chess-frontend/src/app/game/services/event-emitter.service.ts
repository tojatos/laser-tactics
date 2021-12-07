import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventEmitter } from '@angular/core';
import { GameState } from '../game.models';

@Injectable({
  providedIn: 'root'
})
export class EventEmitterService {

  invokeRefreshGameState = new EventEmitter()
  subsRefresh: Subscription | undefined

  invokeMoveRollback = new EventEmitter()
  subsRollback: Subscription | undefined

  invokeToggleObservator = new EventEmitter()
  subsObservator: Subscription | undefined

  invokeRefresh(gameState: GameState): void{
    this.invokeRefreshGameState.emit(gameState)
  }

  invokeRollback(gameState: GameState): void{
    this.invokeMoveRollback.emit(gameState)
  }

  invokeObservator(): void{
    this.invokeToggleObservator.emit()
  }

}

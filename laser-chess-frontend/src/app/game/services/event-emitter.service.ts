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

  invokeToggleObservator = new EventEmitter()
  subsObservator: Subscription | undefined

  constructor() { }

  invokeRefresh(gameState: GameState){
    this.invokeRefreshGameState.emit(gameState)
  }

  invokeObservator(){
    this.invokeToggleObservator.emit()
  }

}

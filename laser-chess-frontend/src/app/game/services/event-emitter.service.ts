import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { GameState } from '../game.models';

@Injectable({
  providedIn: 'root'
})
export class EventEmitterService {

  subsRefresh = new Subject()
  subsRollback = new Subject()

  invokeRefresh(gameState: GameState): void{
    this.subsRefresh.next(gameState)
  }

  invokeRollback(gameState: GameState): void{
    this.subsRollback.next(gameState)
  }

}

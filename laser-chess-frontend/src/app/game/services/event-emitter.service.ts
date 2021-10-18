import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EventEmitterService {

  invokeRefreshIntervalStart = new EventEmitter()
  invokeRefreshGameState = new EventEmitter()
  invokeIntervalPause = new EventEmitter()
  subsIntervalStart: Subscription | undefined
  subsRefresh: Subscription | undefined
  subsPause: Subscription | undefined

  constructor() { }

  invokeIntervalStart(){
    this.invokeRefreshIntervalStart.emit()
  }

  invokeRefresh(){
    this.invokeRefreshGameState.emit()
  }

  toggleRefreshPause(){
    this.invokeIntervalPause.emit()
  }
}

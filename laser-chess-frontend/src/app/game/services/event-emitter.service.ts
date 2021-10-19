import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EventEmitterService {

  invokeRefreshGameState = new EventEmitter()
  subsRefresh: Subscription | undefined

  constructor() { }

  invokeRefresh(){
    this.invokeRefreshGameState.emit()
  }

}

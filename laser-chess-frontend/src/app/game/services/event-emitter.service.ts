import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EventEmitterService {

  invokeRefreshIntervalStart = new EventEmitter()
  subsVar: Subscription | undefined

  constructor() { }

  invokeIntervalStart(){
    this.invokeRefreshIntervalStart.emit()
  }
}

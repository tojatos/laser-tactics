import { EventEmitter, Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginEmitterService {

  invokeLoggedInStateChange = new EventEmitter()
  subsRefresh: Subscription | undefined

  constructor() { }

  invokeLoginToggle(){
    this.invokeLoggedInStateChange.emit()
  }
}

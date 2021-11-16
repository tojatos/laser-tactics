import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent {

  isInitiated = false

  constructor() {
    console.log(this.isInitiated)
    if(!this.isInitiated){
      this.isInitiated = true
    }
  }

}

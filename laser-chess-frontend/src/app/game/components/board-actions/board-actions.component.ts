import { Component, Input,  Output, EventEmitter  } from '@angular/core';

@Component({
  selector: 'app-board-actions',
  templateUrl: './board-actions.component.html',
  styleUrls: ['./board-actions.component.scss']
})
export class BoardActionsComponent {

  @Input() containerWidth: number = 0;

  @Input() containerHeight: number = 0;

  @Input() rotationPossible: boolean = false

  @Input() laserPossible: boolean = false

  @Input() acceptPossible: boolean = false

  @Output() buttonPressEmitter = new EventEmitter<string>();

  private readonly scale = .2

  constructor() { }

  get height(){
    return this.containerHeight * this.scale
  }

  get width(){
    return this.containerWidth * this.scale
  }

  sendButtonPressInfo(value: string) {
    this.buttonPressEmitter.emit(value);
  }


}

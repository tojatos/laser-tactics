import { Component, Input,  Output, EventEmitter  } from '@angular/core';

@Component({
  selector: 'app-board-actions',
  templateUrl: './board-actions.component.html',
  styleUrls: ['./board-actions.component.scss']
})
export class BoardActionsComponent {

  @Input() containerWidth = 0;

  @Input() containerHeight = 0;

  @Input() rotationPossible: boolean | undefined

  @Input() laserPossible: boolean | undefined

  @Input() acceptPossible: boolean | undefined

  @Output() buttonPressEmitter = new EventEmitter<string>();

  private readonly scale = .2

  get height(): number{
    return this.containerHeight * this.scale
  }

  get width(): number{
    return this.containerWidth * this.scale
  }

  sendButtonPressInfo(value: string): void {
    this.buttonPressEmitter.emit(value);
  }


}

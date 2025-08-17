import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-board-actions',
    templateUrl: './board-actions.component.html',
    styleUrls: ['./board-actions.component.scss'],
    standalone: false
})
export class BoardActionsComponent {
  @Input() rotationPossible: boolean | undefined;
  @Input() laserPossible: boolean | undefined;
  @Input() acceptPossible: boolean | undefined;

  @Output() buttonPressEmitter = new EventEmitter<string>();

  sendButtonPressInfo(value: string): void {
    this.buttonPressEmitter.emit(value);
  }
}

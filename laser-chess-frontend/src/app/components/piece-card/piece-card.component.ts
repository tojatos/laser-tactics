import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-piece-card',
    templateUrl: './piece-card.component.html',
    styleUrls: ['./piece-card.component.scss'],
    standalone: false
})
export class PieceCardComponent {
  @Input() name!: string;
  @Input() image!: string;
  @Input() description!: string[];
}

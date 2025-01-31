import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-piece-card',
  templateUrl: './piece-card.component.html',
  styleUrls: ['./piece-card.component.scss'],
})
export class PieceCardComponent {
  @Input() name!: string;
  @Input() image!: string;
  @Input() description!: string[];
}

import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { COLS, ROWS, BLOCK_SIZE } from '../../src/constants';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {
  // Get reference to the canvas.
  @ViewChild('board', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>

  ctx!: CanvasRenderingContext2D | null

  ngOnInit() {
    this.initBoard();
  }

  initBoard() {
    this.ctx = this.canvas.nativeElement.getContext('2d');

    this.ctx!.canvas.width = COLS * BLOCK_SIZE;
    this.ctx!.canvas.height = ROWS * BLOCK_SIZE;

  }

  play() {}
}

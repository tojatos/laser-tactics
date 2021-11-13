import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardLogComponent } from './board-log.component';

describe('BoardLogComponent', () => {
  let component: BoardLogComponent;
  let fixture: ComponentFixture<BoardLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoardLogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoardLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardActionsComponent } from './board-actions.component';

describe('BoardActionsComponent', () => {
  let component: BoardActionsComponent;
  let fixture: ComponentFixture<BoardActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoardActionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoardActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

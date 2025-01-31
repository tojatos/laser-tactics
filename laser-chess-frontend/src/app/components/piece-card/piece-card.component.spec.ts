import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PieceCardComponent } from './piece-card.component';

describe('PieceCardComponent', () => {
  let component: PieceCardComponent;
  let fixture: ComponentFixture<PieceCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PieceCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PieceCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

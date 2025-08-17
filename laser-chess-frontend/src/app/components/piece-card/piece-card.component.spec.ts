import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { PieceCardComponent } from './piece-card.component';

describe('PieceCardComponent', () => {
  let component: PieceCardComponent;
  let fixture: ComponentFixture<PieceCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PieceCardComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
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

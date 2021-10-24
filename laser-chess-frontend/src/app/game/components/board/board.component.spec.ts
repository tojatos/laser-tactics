import { HttpClientTestingModule, } from '@angular/common/http/testing';
import { RouterTestingModule } from "@angular/router/testing";
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardComponent } from './board.component';
import { Canvas } from '../../src/Canvas/Canvas';
import { Resources } from '../../src/Canvas/Resources';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';

describe('BoardComponent', () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoardComponent ],
      imports: [ HttpClientTestingModule, RouterTestingModule ],
      providers: [Canvas, Resources, { provide: JWT_OPTIONS, useValue: JWT_OPTIONS }, JwtHelperService]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

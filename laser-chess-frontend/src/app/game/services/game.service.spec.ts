import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { GameCanvas } from '../src/Display/Canvas/GameCanvas';

import { GameService } from './game.service';

describe('GameService', () => {
  let service: GameService;

  beforeEach(async () =>  {
    TestBed.configureTestingModule({
      imports : [
        HttpClientTestingModule
      ]
    }).compileComponents()
    service = TestBed.inject(GameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

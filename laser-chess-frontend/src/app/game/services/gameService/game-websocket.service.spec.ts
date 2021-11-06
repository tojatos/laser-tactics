import { TestBed } from '@angular/core/testing';

import { GameWebsocketService } from './game-websocket.service';

describe('GameWebsocketService', () => {
  let service: GameWebsocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameWebsocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

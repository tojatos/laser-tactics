import { TestBed } from '@angular/core/testing';

import { GameServiceInterceptor } from './game-service.interceptor';

describe('GameServiceInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      GameServiceInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: GameServiceInterceptor = TestBed.inject(GameServiceInterceptor);
    expect(interceptor).toBeTruthy();
  });
});

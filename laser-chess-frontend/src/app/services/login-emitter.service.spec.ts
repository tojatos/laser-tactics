import { TestBed } from '@angular/core/testing';

import { LoginEmitterService } from './login-emitter.service';

describe('LoginEmitterService', () => {
  let service: LoginEmitterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoginEmitterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

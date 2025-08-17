import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { LoginEmitterService } from './login-emitter.service';

describe('LoginEmitterService', () => {
  let service: LoginEmitterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA]
    });
    service = TestBed.inject(LoginEmitterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

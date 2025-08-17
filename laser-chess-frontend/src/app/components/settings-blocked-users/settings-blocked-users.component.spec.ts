import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { JwtHelperService } from '@auth0/angular-jwt';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { SettingsBlockedUsersComponent } from './settings-blocked-users.component';

describe('SettingsBlockedUsersComponent', () => {
  let component: SettingsBlockedUsersComponent;
  let fixture: ComponentFixture<SettingsBlockedUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SettingsBlockedUsersComponent],
      imports: [NoopAnimationsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        JwtHelperService
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsBlockedUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

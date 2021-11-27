import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsBlockedUsersComponent } from './settings-blocked-users.component';

describe('SettingsBlockedUsersComponent', () => {
  let component: SettingsBlockedUsersComponent;
  let fixture: ComponentFixture<SettingsBlockedUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingsBlockedUsersComponent ]
    })
    .compileComponents();
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

import { NgModule, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';
import { MainNavComponent } from './components/main-nav/main-nav.component';
import { LoginComponent } from './components/login/login.component';
import { GameModule } from './game/game.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth/auth.interceptor';
import { UserPageComponent } from './components/user-page/user-page.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegisterComponent } from './components/register/register.component';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { MainPageComponent } from './components/main-page/main-page.component';
import { LobbyComponent } from './components/lobby/lobby.component';
import { SettingsComponent } from './components/settings/settings.component';
import { SettingsPasswordComponent } from './components/settings-password/settings-password.component';
import { PasswordReminderComponent } from './components/password-reminder/password-reminder.component';
import { SettingsBlockedUsersComponent } from './components/settings-blocked-users/settings-blocked-users.component';
import { VerifyComponent } from './components/verify/verify.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { RankingComponent } from './components/ranking/ranking.component';


@NgModule({
  declarations: [
    AppComponent,
    MainNavComponent,
    LoginComponent,
    UserPageComponent,
    RegisterComponent,
    MainPageComponent,
    LobbyComponent,
    SettingsComponent,
    SettingsPasswordComponent,
    PasswordReminderComponent,
    SettingsBlockedUsersComponent,
    VerifyComponent,
    ChangePasswordComponent,
    RankingComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    GameModule,
    HttpClientModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    FormsModule
    ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }, { provide: JWT_OPTIONS, useValue: JWT_OPTIONS }, JwtHelperService],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
  
})
export class AppModule { }

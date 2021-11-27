import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LobbyComponent } from './components/lobby/lobby.component';
import { LoginComponent } from './components/login/login.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { RegisterComponent } from './components/register/register.component';
import { UserPageComponent } from './components/user-page/user-page.component';
import { GameComponent } from './game/game.component';
import { AuthGuard } from './guards/auth.guard';
import { SettingsPasswordComponent } from './components/settings-password/settings-password.component';
import { SettingsComponent } from './components/settings/settings.component';
import { SettingsBlockedUsersComponent } from './components/settings-blocked-users/settings-blocked-users.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'game/:id',
    component: GameComponent
  },
  {
    path: 'users/:username',
    component: UserPageComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'settings/password',
    component: SettingsPasswordComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'settings/blocked_users',
    component: SettingsBlockedUsersComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'lobby/:id',
    component: LobbyComponent
  },
  {
    path: '**',
    component: MainPageComponent,
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

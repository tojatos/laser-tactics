import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { Router } from '@angular/router';
import { LoginEmitterService } from 'src/app/services/login-emitter.service';
import { LobbyService } from 'src/app/services/lobby.service';
import { Lobby, User } from 'src/app/app.models';
import { MatMenuTrigger } from '@angular/material/menu';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-main-nav',
    templateUrl: './main-nav.component.html',
    styleUrls: ['./main-nav.component.scss'],
    standalone: false
})
export class MainNavComponent {
  private router = inject(Router);
  private breakpointObserver = inject(BreakpointObserver);
  private authService = inject(AuthService);
  private lobbyService = inject(LobbyService);
  private userService = inject(UserService);

  @ViewChild(MatMenuTrigger)
  trigger!: MatMenuTrigger;

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.HandsetPortrait, Breakpoints.Small])
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  lobby: any;
  username = '';
  rating: any;

  get isLoggedin() {
    this.getUsername();
    return this.authService.isLoggedIn();
  }

  logout() {
    this.authService.logout();
  }

  getRating() {
    this.userService.getUserMe().then((userData) => {
      this.rating = userData.rating;
    });
  }

  async joinRandomLobby(isRanked = false) {
    await this.userService.getUserMe().then((userData) => {
      this.rating = userData.rating;
    });

    if (this.rating < 300 && this.rating) {
      this.lobby = await this.lobbyService.joinRandom(0, this.rating + 300, isRanked);
    } else if (this.rating) {
      this.lobby = await this.lobbyService.joinRandom(
        this.rating - 300,
        this.rating + 300,
        isRanked
      );
    }

    this.router.navigate(['/lobby', this.lobby.game_id]);
  }

  getUsername() {
    this.username = this.authService.getUsername();
  }

  closeMenu() {
    this.trigger.closeMenu();
  }
}

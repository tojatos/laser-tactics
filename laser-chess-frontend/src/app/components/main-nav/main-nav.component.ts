import { Component, OnInit, ViewChild } from '@angular/core';
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
  styleUrls: ['./main-nav.component.scss']
})
export class MainNavComponent {

  @ViewChild(MatMenuTrigger)
  trigger!: MatMenuTrigger;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe([Breakpoints.HandsetPortrait, Breakpoints.Small])
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private router: Router, private breakpointObserver: BreakpointObserver, private authService: AuthService, private lobbyService: LobbyService, private userService: UserService) { }

  lobby: any
  username = ""
  rating: any

  get isLoggedin() {
    this.getUsername()
    return this.authService.isLoggedIn()
  }

  async logout() {
    this.authService.logout().then().finally(() => {
      this.authService.clearJWT()
    })
    this.router.navigate(['/'])
  }

  getRating() {
    this.userService.getUserMe().then(userData => {
      this.rating = userData.rating
    })
  }

  async joinRandomLobby(isRanked = false) {

    await this.userService.getUserMe().then(userData => {
      this.rating = userData.rating
    })

    if (this.rating < 300 && this.rating) {
      this.lobby = await this.lobbyService.joinRandom(0, this.rating + 300, isRanked)
    }
    else if (this.rating) {
      this.lobby = await this.lobbyService.joinRandom(this.rating - 300, this.rating + 300, isRanked)
    }

    this.router.navigate(['/lobby', this.lobby.game_id])
  }

  getUsername() {
    this.username = this.authService.getUsername()
  }

  closeMenu() {
    this.trigger.closeMenu()
  }

}

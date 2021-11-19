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

  constructor(private router: Router,private breakpointObserver: BreakpointObserver, private authService: AuthService, private lobbyService: LobbyService) {}

    lobby: any
    username = ""

    get isLoggedin(){
      this.getUsername()
      return this.authService.isLoggedIn()
    }

    logout(){
      this.authService.clearJWT()
      this.router.navigate(['/'])
    }

    async createLobby(){
      this.lobby = await this.lobbyService.createLobby()
      this.router.navigate(['/lobby', this.lobby.game_id])
    }

    getUsername(){
      this.username = this.authService.getUsername()
    }

    closeMenu(){
      this.trigger.closeMenu()
    }

}

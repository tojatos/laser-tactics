import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { Router } from '@angular/router';
import { LoginEmitterService } from 'src/app/services/login-emitter.service';
import { LobbyService } from 'src/app/services/lobby.service';
import { Lobby } from 'src/app/app.models';

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss']
})
export class MainNavComponent {

  isHandset$: Observable<boolean> = this.breakpointObserver.observe([Breakpoints.HandsetPortrait, Breakpoints.Small])
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private router: Router,private breakpointObserver: BreakpointObserver, private authService: AuthService, private lobbyService: LobbyService) {}
    // lobby: Lobby | undefined
    lobby: any
    get isLoggedin(){
      return this.authService.isLoggedIn()
    }

    logout(){
      this.authService.clearJWT()
      this.router.navigate(['/'])
    }

    getUsername(){
      this.authService.getCurrentJwtInfo()!.sub
    }

    async createLobby(){
      this.lobby = await this.lobbyService.createLobby()
      console.log(this.lobby)
      this.router.navigate(['/lobby', this.lobby.id])
        }
      
    
}

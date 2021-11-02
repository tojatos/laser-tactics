import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { Router } from '@angular/router';
import { LoginEmitterService } from 'src/app/services/login-emitter.service';

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

  constructor(private router: Router,private breakpointObserver: BreakpointObserver, private authService: AuthService) { }

    get isLoggedin(){
      return this.authService.isLoggedIn()
    }

    logout(){
      this.authService.clearJWT()
      this.router.navigate(['/'])
    }   

}

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

  loggedIn = false;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe([Breakpoints.HandsetPortrait, Breakpoints.Small])
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private router: Router,private breakpointObserver: BreakpointObserver, private authService: AuthService, private loginEmitter: LoginEmitterService) { }

  ngOnInit(): void {   
    if (this.loginEmitter.subsRefresh == undefined) {
      this.loginEmitter.subsRefresh = this.loginEmitter.
      invokeLoggedInStateChange.subscribe(() => {
        this.changeLoginState()
      });
    }
    this.loggedIn = this.isLoggedin() 
  }

    isLoggedin(){
      if (this.authService.isLoggedIn()) {
        return true;
      }
      else return false;
    }

    logout(){
      this.authService.clearJWT()
      this.router.navigate(['/'])
      this.loggedIn = false;
    }   

    changeLoginState(){
      this.loggedIn = !this.loggedIn
    }
}

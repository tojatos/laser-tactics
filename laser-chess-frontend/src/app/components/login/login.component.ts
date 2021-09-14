import { Component } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  constructor(private authService: AuthService) {}

  async ngOnInit(){
    await this.login()
  }

  async login() {
      const userData = {login: "login", pass: "pass"}

      if (!this.authService.isLoggedIn()) {
          this.authService.login(userData.login, userData.pass).then(
                  res => {
                      console.log(`User with token ${res.tokenID} is logged in`);
                  }
              )
      }
      else this.authService.clearJWT()
  }
}

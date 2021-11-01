import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import {FormControl, Validators, FormGroup} from '@angular/forms';
import { LoginEmitterService } from 'src/app/services/login-emitter.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})


export class LoginComponent {

  @Output() public changeLoginState: EventEmitter<boolean> = new EventEmitter<boolean>();

  hide = true;
  form = new FormGroup({
    username: new FormControl(''),
    password: new FormControl(''),
  });
  isLoggedIn = false;
  errorMessage = '';
  constructor(private authService: AuthService, private route: ActivatedRoute, private router: Router, private loginEmitter: LoginEmitterService) {}

    get f() { return this.form.controls; }

    onSubmit(): void {
      const { username, password } = this.form.value;
      console.log(this.form.value)
      if (!this.authService.isLoggedIn() && username && password) {
        this.authService.login(username, password).then(
                  res => {
                      console.log(`User with token ${res.access_token} is logged in`);
                      this.loginEmitter.invokeLoginToggle()
                      this.router.navigate(['/'])
                  }
              )
      }
    }

}

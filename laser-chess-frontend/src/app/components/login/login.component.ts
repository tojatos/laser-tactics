import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { UntypedFormControl, Validators, UntypedFormGroup } from '@angular/forms';
import { LoginEmitterService } from 'src/app/services/login-emitter.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  @Output() public changeLoginState: EventEmitter<boolean> = new EventEmitter<boolean>();

  hide = true;
  form = new UntypedFormGroup({
    username: new UntypedFormControl('', [Validators.required]),
    password: new UntypedFormControl('', [Validators.required]),
  });
  isLoggedIn = false;
  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private loginEmitter: LoginEmitterService
  ) {}

  get f() {
    return this.form.controls;
  }

  g() {}
  onSubmit(): void {
    const { username, password } = this.form.value;
    if (!this.authService.isLoggedIn() && username && password) {
      this.authService
        .login(username, password)
        .then((res) => {
          this.router.navigate(['/']);
        })
        .catch((err) => console.error(err));
    }
  }
}

import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { UntypedFormControl, Validators, UntypedFormGroup } from '@angular/forms';
import { LoginEmitterService } from 'src/app/services/login-emitter.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: false
})
export class LoginComponent {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private loginEmitter = inject(LoginEmitterService);

  @Output() public changeLoginState: EventEmitter<boolean> = new EventEmitter<boolean>();

  hide = true;
  form = new UntypedFormGroup({
    username: new UntypedFormControl('', [Validators.required]),
    password: new UntypedFormControl('', [Validators.required]),
  });
  isLoggedIn = false;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);
  constructor() {}

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

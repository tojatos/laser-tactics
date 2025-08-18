import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { UntypedFormControl, Validators, UntypedFormGroup } from '@angular/forms';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
    standalone: false
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  hide = true;
  form = new UntypedFormGroup({
    username: new UntypedFormControl('', [Validators.required]),
    email: new UntypedFormControl('', [Validators.required, Validators.email]),
    password: new UntypedFormControl('', [Validators.required]),
  });

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);
  constructor() {}

  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    const { username, email, password } = this.form.value;
    if (!this.authService.isLoggedIn() && username && email && password) {
      this.authService
        .register(username, email, password)
        .then((res) => {
          this.router.navigate(['/login']);
        })
        .catch((err) => console.error(err));
    }
  }
  get loggedIn() {
    return this.authService.isLoggedIn();
  }
}

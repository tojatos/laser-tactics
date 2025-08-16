import { Component, OnInit } from '@angular/core';
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
  hide = true;
  form = new UntypedFormGroup({
    username: new UntypedFormControl('', [Validators.required]),
    email: new UntypedFormControl('', [Validators.required, Validators.email]),
    password: new UntypedFormControl('', [Validators.required]),
  });
  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

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

import { Component, OnInit, inject } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
    selector: 'app-password-reminder',
    templateUrl: './password-reminder.component.html',
    styleUrls: ['./password-reminder.component.scss'],
    standalone: false
})
export class PasswordReminderComponent {
  private _snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  hide = true;
  form = new UntypedFormGroup({
    email: new UntypedFormControl('', [Validators.required, Validators.email]),
  });

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);
  constructor() {}

  openSnackBar(message: string) {
    this._snackBar.open(message, '', {
      duration: 1000,
    });
  }
  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    const { email } = this.form.value;
    if (!this.authService.isLoggedIn() && email) {
      this.authService
        .sendPasswordChangeRequest(email)
        .then((res) => {
          this.openSnackBar('Email sent');
        })
        .catch((err) => console.error(err));
    }
  }
  get loggedIn() {
    return this.authService.isLoggedIn();
  }
}

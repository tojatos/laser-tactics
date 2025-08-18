import { Component, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  FormGroupDirective,
  NgForm,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-settings-password',
    templateUrl: './settings-password.component.html',
    styleUrls: ['./settings-password.component.scss'],
    standalone: false
})
export class SettingsPasswordComponent {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  hide = true;
  hide2 = true;
  hide3 = true;
  matcher = new MyErrorStateMatcher();
  form = new UntypedFormGroup(
    {
      password: new UntypedFormControl('', [Validators.required]),
      new_password: new UntypedFormControl('', [Validators.required]),
      // retype_new_password: new FormControl('',[Validators.required])
    },
    { validators: this.samePasswordValidator2 }
  );

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  get password() {
    return this.form.get('password');
  }
  get new_password() {
    return this.form.get('new_password');
  }
  get retype_new_password() {
    return this.form.get('retype_new_password');
  }
  get f() {
    return this.form.controls;
  }
  get loggedIn() {
    return this.authService.isLoggedIn();
  }

  // onPasswordInput() {
  //   if (this.form!.hasError('passwordMismatch'))
  //     this.retype_new_password!.setErrors([{'passwordMismatch': true}]);
  //   else
  //     this.retype_new_password!.setErrors(null);
  // }

  onSubmit(): void {
    const { password, new_password } = this.form.value;
    if (this.authService.isLoggedIn() && password && new_password) {
      this.userService
        .changePassword(password, new_password)
        .then((res) => {
          this.router.navigate(['/login']);
          this.authService.clearJWT();
        })
        .catch((err) => console.error(err));
    }
  }
  samePasswordValidator2(control: AbstractControl): ValidationErrors | null {
    const new_password = control.get('new_password');
    const retype_new_password = control.get('retype_new_password');

    return new_password && retype_new_password && new_password.value != retype_new_password.value
      ? { samePassword: true }
      : null;
  }
}

export const samePasswordValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const new_password = control.get('new_password');
  const retype_new_password = control.get('retype_new_password');

  return new_password && retype_new_password && new_password.value != retype_new_password.value
    ? { samePassword: true }
    : null;
};

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: UntypedFormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

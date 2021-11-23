import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-settings-password',
  templateUrl: './settings-password.component.html',
  styleUrls: ['./settings-password.component.scss']
})
export class SettingsPasswordComponent implements OnInit {
  
  hide = true;
  form = new FormGroup({
      password: new FormControl('',[Validators.required]),
      new_password: new FormControl('',[Validators.required]),
      retype_new_password: new FormControl('',[Validators.required])
    },{validators: samePasswordValidator})

  constructor(private userService: UserService, private authService: AuthService, private route: ActivatedRoute, private router: Router) { }

  

  ngOnInit(): void {
    
  }

  get password() { return this.form!.get('password'); }
  get new_password() { return this.form!.get('new_password'); }
  get retype_new_password() { return this.form!.get('retype_new_password'); }
  get f() { return this.form!.controls; }
  get loggedIn() {
    return this.authService.isLoggedIn()
  }

  // onPasswordInput() {
  //   if (this.form!.hasError('passwordMismatch'))
  //     this.retype_new_password!.setErrors([{'passwordMismatch': true}]);
  //   else
  //     this.retype_new_password!.setErrors(null);
  // }

  onSubmit(): void {
    const { password, new_password, retype_new_password } = this.form!.value;
    const username = this.authService.getUsername()
    if (this.authService.isLoggedIn() && password && new_password && retype_new_password) {
      this.userService.changePassword(password, new_password).then(res => {
        this.authService.sendPasswordChangeRequest(username)
        this.router.navigate(['/login'])
        this.authService.clearJWT()
      }).catch(err => console.log(err))
    }
    else {
      console.log("")
    }
  }

}

export const samePasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const new_password = control.get('new_password');
  const retype_new_password = control.get('retype_new_password');

  return new_password && retype_new_password && new_password.value === retype_new_password.value ? { samePassword: true } : null;
};


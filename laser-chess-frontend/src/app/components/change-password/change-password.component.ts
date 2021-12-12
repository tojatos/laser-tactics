import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  hide = true;
  hide2 = true;
  hide3 = true;
  form = new FormGroup({
      new_password: new FormControl('',[Validators.required]),
    })
  token: string | undefined

  constructor(private userService: UserService, private authService: AuthService, private route: ActivatedRoute, private router: Router) { }


  ngOnInit(): void {
    this.route.params.subscribe(params =>
      {
        this.token = params.id
      })
  }

  get f() { return this.form.controls; }
  get loggedIn() {
    return this.authService.isLoggedIn()
  }

  onSubmit(): void {
    const  { new_password } = this.form.value;
    if (new_password && this.token) {
      this.userService.changePasswordWithToken(this.token, new_password).then(res => {
        this.router.navigate(['/login'])
        this.authService.clearJWT()
      }).catch(err => console.error(err))
    }
  }

}

import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-password-reminder',
  templateUrl: './password-reminder.component.html',
  styleUrls: ['./password-reminder.component.scss']
})
export class PasswordReminderComponent implements OnInit {

  hide = true;
  form = new FormGroup({
    email: new FormControl('',[Validators.required, Validators.email])
  });
  constructor(private _snackBar: MatSnackBar,private authService: AuthService, private route: ActivatedRoute, private router: Router) { }

  openSnackBar(message: string) {
    this._snackBar.open(message, "", {
      duration: 1000
    });
  }

  ngOnInit(): void {
  }

  get f() { return this.form.controls; }

  onSubmit(): void {
    const {email} = this.form.value;
    if (!this.authService.isLoggedIn() &&  email ) {
      this.authService.sendPasswordChangeRequest(email).then(res => {
        this.openSnackBar("Email sent")
      }).catch(err => console.log(err))
    }
    else {
      console.log("")
    }
  }
  get loggedIn() {
    return this.authService.isLoggedIn()
  }
}

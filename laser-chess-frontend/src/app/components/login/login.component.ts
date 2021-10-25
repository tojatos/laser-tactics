import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  form: any = {
    username: null,
    password: null
  };
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  constructor(private authService: AuthService, private route: ActivatedRoute) {}

    ngOnInit(): void {
      this.authService.clearJWT()
      if (this.authService.isLoggedIn()) {
        this.isLoggedIn = true;
      }
    }

    get f() { return this.form.controls; }
    
    onSubmit(): void {
      const { username, password } = this.form;
      console.log(username, password)
      if (!this.authService.isLoggedIn() && username && password) {
        this.authService.login(username, password).then(
                  res => {
                      console.log(`User with token ${res.access_token} is logged in`);
                  }
              )
                }
      else this.authService.clearJWT()
        
      
    }
    reloadPage(): void {
      window.location.reload();
    }



}
// export class LoginComponent implements OnInit {

//   constructor(private authService: AuthService, private route: ActivatedRoute) {}

//   ngOnInit(){
//     this.route.queryParams.subscribe(
//       async res => {
//         this.login(res.user, res.pass)
//       }
//     )
//   }

//   login(user: string | null, pass: string | null) {

//       if (!this.authService.isLoggedIn() && user && pass) {
//           this.authService.login(user, pass).then(
//                   res => {
//                       console.log(`User with token ${res.access_token} is logged in`);
//                   }
//               )
//       }
//       else this.authService.clearJWT()
//   }
// }

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  form: any = {
    username: null,
    email: null,
    password: null
  };
  isLoggedIn = false;
  isRegisterFailed = false;
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
      const { username, email, password } = this.form;
      console.log(username, email, password)
      if (!this.authService.isLoggedIn() && username && email && password) {
        this.authService.register(username, email, password)
                }
      else this.authService.clearJWT()
        
      
    }
    reloadPage(): void {
      window.location.reload();
    }


}

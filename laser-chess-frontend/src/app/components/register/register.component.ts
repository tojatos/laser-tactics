import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import {FormControl, Validators, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  hide = true;
  form = new FormGroup({
    username: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl(''),
  });
  isLoggedIn = false;
  errorMessage = '';
  constructor(private authService: AuthService, private route: ActivatedRoute, private router: Router) {}

    ngOnInit(): void {
    }

    get f() { return this.form.controls; }
    
    onSubmit(): void {
      const { username, email, password } = this.form.value;
      if (!this.authService.isLoggedIn() && username && email && password) {
        this.authService.register(username, email, password)
        this.router.navigate(['/login']);
                }
      else this.authService.clearJWT()
        
      
    }


}

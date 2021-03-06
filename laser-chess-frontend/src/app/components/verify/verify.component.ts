import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss']
})
export class VerifyComponent implements OnInit {

  constructor(private route: ActivatedRoute, private authService: AuthService, private router: Router) {}
  
  token: string | undefined
  ngOnInit(): void {
    this.route.params.subscribe(params =>
      {
        this.token = params.id
      })
  }

  verifyUser(){
    this.authService.verifyUser(this.token!)
    this.router.navigate([''])
  }

}

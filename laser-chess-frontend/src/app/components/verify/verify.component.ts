import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
    selector: 'app-verify',
    templateUrl: './verify.component.html',
    styleUrls: ['./verify.component.scss'],
    standalone: false
})
export class VerifyComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private router = inject(Router);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  token: string | undefined;
  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.token = params.id;
    });
  }

  verifyUser() {
    this.authService.verifyUser(this.token!);
    this.router.navigate(['']);
  }
}

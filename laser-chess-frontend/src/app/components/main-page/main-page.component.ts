import { Component } from "@angular/core";
import { AuthService } from "src/app/auth/auth.service";

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})

export class MainPageComponent  {

  username = ""

  constructor(private authService: AuthService,) { 
    this.username = this.authService.getUsername()
  }
}

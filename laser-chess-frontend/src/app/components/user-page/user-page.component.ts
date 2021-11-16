import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/app.models';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-user-page',
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.scss']
})
export class UserPageComponent {

  constructor(private userService: UserService, private route: ActivatedRoute) { }

  user: User | undefined

  ngOnInit(): void {
    this.route.params.subscribe(async params => {
      this.userService.getUserMe().then(userData => {
        this.user = userData
    })
    })

  }

}


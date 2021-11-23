import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { FriendRequest, User } from 'src/app/app.models';
import { AuthService } from 'src/app/auth/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-user-page',
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.scss']
})
export class UserPageComponent {

  constructor(private _snackBar: MatSnackBar, private userService: UserService, private route: ActivatedRoute, private authService: AuthService, private router: Router) { }

  user: User | undefined
  username: string | undefined
  friends: [] | undefined
  friendsRequests: FriendRequest[] | undefined

  openSnackBar(message: string) {
    this._snackBar.open(message, "", {
      duration: 1000
    });
  }

  ngOnInit(): void {
    this.username = this.route.snapshot.paramMap.get('username')!
    this.route.params.subscribe(async params => {
      this.userService.getUserByUsername(this.username!).then(userData => {
        this.user = userData
    })
      this.userService.getUserFriends().then(userData => {
        this.friends = userData
        console.log(this.friends)
    })
      this.userService.getUserFriendsRequests().then(userData => {
      this.friendsRequests = userData
      console.log(this.friendsRequests)
    })
    })

  }

  get isOwner(){
    if (this.authService.getUsername() == this.username){
      return true}
    else return false
  }

  acceptFriendRequest(id: string){
    this.userService.acceptFriendRequests(id)
  }

  declineFriendRequest(id: string){
    this.userService.declineFriendRequests(id)
  }

  unfriend(username: string){
    this.userService.removeFriend(username)
  }

  goToProfile(name: string){
    this.router.navigate(['/users', name])
  }

  async blockUser(name: string){
    this.openSnackBar("Blocked user")
    await this.userService.blockUser(name)
  }

  async sendRequest(name: string){
    this.openSnackBar("Request sent")
    await this.userService.sendFriendRequests(name)
  }

  onEnter(action: string, name: string) { 
    if (action == "add"){
    this.sendRequest(name) }
    if (action == "block"){
      this.blockUser(name) }}

}


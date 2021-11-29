import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { FriendRequest, User, UserStats } from 'src/app/app.models';
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
  friends: string[] | undefined
  blocked: string[] | undefined
  friendsRequests: FriendRequest[] | undefined
  stats: UserStats | undefined
  form = new FormGroup({
    input: new FormControl('')
  });
  openSnackBar(message: string) {
    this._snackBar.open(message, "", {
      duration: 1000
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.route.params.subscribe(async params => {
      this.username = params.username
      this.userService.getUserByUsername(params.username).then(userData => {
        this.user = userData
    })
      this.userService.getUserFriends().then(userData => {
        this.friends = userData
        this.isInFriends
    })
      this.userService.getUserFriendsRequests().then(userData => {
      this.friendsRequests = userData
    })
    this.userService.getUserStats(this.username!).then(userData => {
      this.stats = userData
    })
    this.userService.getBlockedUsers().then(userData => {
      this.blocked = userData
      console.log(this.blocked)
    })
    })
  }

  get isOwner(){
    if (this.authService.getUsername() == this.username){
      return true}
    else return false
  }

  get isInFriends() {
    if (this.friends) {
      if (this.friends.includes(this.username!)) {
        return true
      }
      else return false
    }
    else return false
  }

  get isInBlocked() {
    if (this.blocked) {
      if (this.blocked.includes(this.username!)) {
        return true
      }
      else return false
    }
    else return false
  }

  getIsInFriends(name: string) {
    if (this.friends) {
      if (this.friends.includes(name)) {
        return true
      }
      else return false
    }
    else return false
  }

  getIsInBlocked(name: string) {
    if (this.blocked) {
      if (this.blocked.includes(name)) {
        return true
      }
      else return false
    }
    else return false
  }

  acceptFriendRequest(id: string){
    this.userService.acceptFriendRequests(id)
    this.loadData()
  }

  declineFriendRequest(id: string){
    this.userService.declineFriendRequests(id)
    this.loadData()
  }

  unfriend(username: string){
    this.openSnackBar("Unfriended user")
    this.userService.removeFriend(username)
    this.loadData()
  }

  goToProfile(name: string){
    this.router.navigate(['/users', name])
    this.loadData()
  }

  async blockUser(name: string){
    this.openSnackBar("Blocked user")
    await this.userService.blockUser(name)
    this.loadData()
  }

  async unblockUser(name: string){
    this.openSnackBar("Unblocked user")
    await this.userService.unblockUser(name)
    this.loadData()
  }

  async sendRequest(name: string){
    this.openSnackBar("Request sent")
    await this.userService.sendFriendRequests(name)
    this.loadData()
  }

  get f() { return this.form.controls; }

  onSubmit(): void {
    if (this.authService.isLoggedIn() && this.form.value.input) {
      this.sendRequest(this.form.value.input);
    }
  }
  

}


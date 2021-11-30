import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { sortBy } from 'lodash';
import { FriendRequest, User, UserHistory, UserStats } from 'src/app/app.models';
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
  history: UserHistory[] | undefined
  dataSource = new MatTableDataSource<UserHistory>();
  empty = true
  empty_req = true
  rating = 0

  displayedColumns = ['Date', 'Opponent', 'Result'];

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
        this.rating = this.user.rating
    })
      this.userService.getUserFriends().then(userData => {
        this.friends = userData
        if (this.friends?.length != 0) {
          this.empty = false
        }
        if (this.friends?.length == 0) {
          this.empty = true
        }
        this.isInFriends
    })
      this.userService.getUserFriendsRequests().then(userData => {
      this.friendsRequests = userData
      if (this.friendsRequests?.length != 0) {
        this.empty_req = false
      }
      if (this.friendsRequests?.length == 0) {
        this.empty_req = true
      }
    })
    this.userService.getUserStats(this.username!).then(userData => {
      this.stats = userData
    })
    this.userService.getUserGameHistory(this.username!).then(userData => {
      const data = userData
      this.dataSource.data = sortBy(
        data, ['game_end_date']
      )
    })
    this.userService.getBlockedUsers().then(userData => {
      this.blocked = userData
    })
    })
  }

  get isOwner(){
    if (this.authService.getUsername() == this.username){
      return true}
    else {
    return false}
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
      this.loadData()
    }
  }

  getDate(date: string) {
    const parsedDate = new Date(date)
    return parsedDate.getDate().toString() + ' ' + parsedDate.getMonth().toString() + ' ' + parsedDate.getFullYear().toString()
  }

  getOpponent(history: UserHistory){
    if (this.authService.getUsername() == history.player_one_username){
      return history.player_two_username
    }
    else return history.player_one_username
  }

  getResult(history: UserHistory){
    if (this.authService.getUsername() == history.player_one_username){
      if (history.result == "PLAYER_ONE_WIN"){
        return "WIN"}
      return "DEFEAT"
    }
    else {
      if (history.result == "PLAYER_TWO_WIN"){
      return "WIN"}
    return "DEFEAT"
  }}

  goToGame(history: UserHistory){
    this.router.navigate(['game', history.game_id])
  }

  getGameId(history: UserHistory){
    return history.game_id
  }

}


import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-settings-blocked-users',
  templateUrl: './settings-blocked-users.component.html',
  styleUrls: ['./settings-blocked-users.component.scss']
})
export class SettingsBlockedUsersComponent implements OnInit {

 
  constructor(private _snackBar: MatSnackBar, private userService: UserService, private route: ActivatedRoute, private authService: AuthService, private router: Router) { }

  username: string | undefined
  blocked: string[] | undefined
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
    this.userService.getBlockedUsers().then(userData => {
      this.blocked = userData
      console.log(this.blocked)
    })
    })
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

  getIsInBlocked(name: string) {
    if (this.blocked) {
      if (this.blocked.includes(name)) {
        return true
      }
      else return false
    }
    else return false
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
    this.userService.unblockUser(name)
    this.loadData()
  }

  get f() { return this.form.controls; }

  onSubmit(): void {
    if (this.authService.isLoggedIn() && this.form.value.input) {
      this.blockUser(this.form.value.input);
    }
  }

}

import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { sortBy } from 'lodash';
import { Lobby, User } from 'src/app/app.models';
import { AuthService } from 'src/app/auth/auth.service';
import { LobbyService } from 'src/app/services/lobby.service';
import { UserService } from 'src/app/services/user.service';
import { LobbyStatus } from '../lobby/lobby.component';

@Component({
  selector: 'app-lobby-list',
  templateUrl: './lobby-list.component.html',
  styleUrls: ['./lobby-list.component.scss']
})

export class LobbyListComponent implements OnInit {

  dataSource = new MatTableDataSource<Lobby>();
  fetched = false
  lobby: Lobby | undefined
  ranked = false
  verified = false
  user: User | undefined
  public lobbies: Lobby[] | undefined
  displayedColumns = ['name', 'player_one_username', 'player_two_username', 'Mode', 'join'];

  constructor(private _snackBar: MatSnackBar, private authService: AuthService, private lobbyService: LobbyService, private router: Router, private userService: UserService) {}

  openSnackBar(message: string) {
    this._snackBar.open(message, "", {
      duration: 1000
    });
  }

  get isLoggedin(){
    return this.authService.isLoggedIn()
  }

  async ngOnInit() {
    const data = await this.lobbyService.getLobbies()
    this.dataSource.data = sortBy(
      data.filter(res => !res.is_private && res.lobby_status == LobbyStatus.CREATED
        && ((new Date().getTime()) - new Date(res.lobby_creation_date).getTime()) < 3600000 * 8
        ),
      ['id']).slice(-8)
    this.fetched = true
    if (this.isLoggedin){
    this.userService.getUserMe().then(userData =>{
      this.user = userData
      this.verified = this.user.is_verified!
    })
    }
  }

  openLobby(lobby: Lobby) {
    this.router.navigate(['/lobby', lobby.game_id])
  }

  joinLobby(lobby: Lobby) {
    this.lobbyService.joinLobby(lobby.game_id)
    this.router.navigate(['/lobby', lobby.game_id])
  }

  getMode(ranked: any) {
    if (ranked){
      return 'Ranked'
    }
    else{
      return 'Casual'
    }
  }
  getVerified(){
    this.userService.getUserMe().then(userData =>{
      this.user = userData
    })
    return this.user?.is_verified
  }

  async refreshList(){
    this.fetched = false
    const data = await this.lobbyService.getLobbies()
    this.dataSource.data = sortBy(
      data.filter(res => !res.is_private && res.lobby_status == LobbyStatus.CREATED
        && ((new Date().getTime()) - new Date(res.lobby_creation_date).getTime()) < 3600000 * 4
        ),
      ['id']).slice(-8)
    this.fetched = true
  }

  async createLobby(){
    this.lobby = await this.lobbyService.createLobby()
    this.router.navigate(['/lobby', this.lobby.game_id])
      }

  async createPrivateLobby(){
    this.lobby = await this.lobbyService.createLobby()
    this.lobby.is_private = true
    this.lobbyService.updateLobby(this.lobby)
    this.router.navigate(['/lobby', this.lobby.game_id])
      }

  async createRankedLobby(){
    this.lobby = await this.lobbyService.createLobby()
    this.lobby.is_ranked = true
    this.lobbyService.updateLobby(this.lobby)
    this.router.navigate(['/lobby', this.lobby.game_id])
      }

  async createPrivateRankedLobby(){
    this.lobby = await this.lobbyService.createLobby()
    this.lobby.is_ranked = true
    this.lobby.is_private = true
    this.lobbyService.updateLobby(this.lobby)
    this.router.navigate(['/lobby', this.lobby.game_id])
      }

  sendVerifyEmail(){
    this.openSnackBar("Email sent")
    this.authService.sendVerficationMail(this.authService.getUsername())

  }

}

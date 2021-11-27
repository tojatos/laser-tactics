import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { sortBy } from 'lodash';
import { Lobby, User } from 'src/app/app.models';
import { AuthService } from 'src/app/auth/auth.service';
import { LobbyService } from 'src/app/services/lobby.service';
import { UserService } from 'src/app/services/user.service';
import { LobbyStatus } from '../lobby/lobby.component';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})

export class MainPageComponent implements OnInit {

  dataSource = new MatTableDataSource<Lobby>();
  fetched = false
  lobby: any
  ranked = false
  verified = false
  user: User | undefined
  public lobbies: Lobby[] | undefined
  displayedColumns = ['name', 'player_one_username', 'player_two_username', 'Mode', 'join'];

  constructor(private _liveAnnouncer: LiveAnnouncer, private authService: AuthService, private route: ActivatedRoute, private lobbyService: LobbyService, private router: Router, private userService: UserService) {}

  async ngOnInit() {

    const data = await this.lobbyService.getLobbies()
    this.dataSource.data = sortBy(
      data.filter(res => !res.is_private && res.lobby_status == LobbyStatus.CREATED
        && ((new Date().getTime()) - new Date(res.lobby_creation_date).getTime()) < 3600000 * 2
        ), 
      ['id']).slice(-8)
    this.fetched = true
    this.userService.getUserMe().then(userData =>{
      this.user = userData
      this.verified = this.user.is_verified!
    })
    
    console.log(this.verified)
  }

  openLobby(lobby: Lobby) {
    console.log(lobby)
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
      console.log(this.user)
    })
    return this.user?.is_verified
  }

  async refreshList(){
    this.fetched = false
    const data = await this.lobbyService.getLobbies()
    this.dataSource.data = sortBy(
      data.filter(res => !res.is_private && res.lobby_status == LobbyStatus.CREATED
        && ((new Date().getTime()) - new Date(res.lobby_creation_date).getTime()) < 3600000 * 2
        ), 
      ['id']).slice(-8)
    this.fetched = true
  }

  async createLobby(){
    this.lobby = await this.lobbyService.createLobby()
    console.log(this.lobby)
    this.router.navigate(['/lobby', this.lobby.game_id])
      }

  async createPrivateLobby(){
    this.lobby = await this.lobbyService.createLobby()
    this.lobby.is_private = true
    this.lobbyService.updateLobby(this.lobby)
    console.log(this.lobby)
    this.router.navigate(['/lobby', this.lobby.game_id])
      }

  async createRankedLobby(){
    this.lobby = await this.lobbyService.createLobby()
    this.lobby.is_ranked = true
    this.lobbyService.updateLobby(this.lobby)
    console.log(this.lobby)
    this.router.navigate(['/lobby', this.lobby.game_id])
      }

  async createPrivateRankedLobby(){
    this.lobby = await this.lobbyService.createLobby()
    this.lobby.is_ranked = true
    this.lobby.is_private = true
    this.lobbyService.updateLobby(this.lobby)
    console.log(this.lobby)
    this.router.navigate(['/lobby', this.lobby.game_id])
      }

  sendVerifyEmail(){
    this.authService.sendVerficationMail(this.authService.getUsername())
  }

}

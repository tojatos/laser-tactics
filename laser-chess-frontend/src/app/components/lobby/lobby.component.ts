import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Lobby, User } from 'src/app/app.models';
import { AuthService } from 'src/app/auth/auth.service';
import * as _ from 'lodash';
import { LobbyService } from 'src/app/services/lobby.service';
import { UserService } from 'src/app/services/user.service';

export enum LobbyStatus {
  CREATED = "CREATED",
  ABANDONED = "ABANDONED",
  GAME_STARTED = "GAME_STARTED",
  GAME_ENDED = "GAME_ENDED"
}

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit, OnDestroy {

  constructor(private lobbyService: LobbyService, private authService: AuthService, private route: ActivatedRoute, private router: Router, private userService: UserService) { }

  lobby: Lobby | undefined
  refresh = true
  player_one: string | undefined
  player_two: string | undefined
  isRanked: string | undefined
  isPrivate: string | undefined
  username = ""

  @HostListener('window:popstate', ['$event'])
  onPopState(event: Event) {
    window.location.reload()
  }

  ngOnInit(): void {
    this.route.params.subscribe(async params => {
      this.refreshLobbyState(params.id)
      this.username = this.authService.getUsername()

    })
  }
  ngOnDestroy(): void {
    this.refresh = false
  }

  async changePlayers(){
    if (this.lobby && this.username== this.lobby.player_one_username) {
      this.lobby.starting_position_reversed = !this.lobby.starting_position_reversed
      await this.lobbyService.updateLobby(this.lobby)
    }
  }

  async joinLobby(){
    if (this.lobby && this.username!= this.lobby.player_one_username) {
      await this.lobbyService.joinLobby(this.lobby.game_id)
    }
  }

  // changeIfRanked() {
  //   if (this.lobby && this.user?.username== this.lobby.player_one_username) {
  //     if (this.isRanked == "Not ranked"){
  //       this.isRanked = "Ranked"
  //     }
  //     else{this.isRanked = "Not ranked"}
  //     !this.lobby.is_ranked
  //     this.lobbyService.updateLobby(this.lobby)
  //   }
  // }

  async startGame() {
    if (this.lobby &&  this.player_one && this.player_two&& this.username== this.lobby.player_one_username) {
      await this.lobbyService.startGame(this.lobby.game_id, this.player_one, this.player_two)
      this.router.navigate(['/game', this.lobby.game_id])
    }

  }

  leaveLobby() {
    if (this.lobby && (this.username== this.lobby.player_one_username ||this.username== this.lobby.player_two_username)){
    this.lobbyService.leaveLobby(this.lobby.game_id)
    this.router.navigate(['/'])
    }
  }

  async refreshLobbyState(gameId: string){
    const lobbyData = await this.lobbyService.getLobbyById(gameId)
    if(this.lobby?.lobby_status == LobbyStatus.GAME_STARTED)
      this.router.navigate(['/game', this.lobby.game_id])

    this.lobby = lobbyData
    this.player_one = this.lobby.player_one_username
    this.player_two = this.lobby.player_two_username
    if(this.lobby.is_ranked){
      this.isRanked = "Ranked"
    }
    else{
      this.isRanked = "Casual"
    }
    if(this.lobby.is_private){
      this.isPrivate = "Private"
    }
    else{
      this.isPrivate = "Public"
    }
    if(this.lobby?.starting_position_reversed){
      const p1 = this.player_one
      this.player_one = this.player_two
      this.player_two = p1
    }
    if(this.refresh)
      window.setTimeout(() => this.refreshLobbyState(gameId), 500)
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Lobby } from 'src/app/app.models';
import { AuthService } from 'src/app/auth/auth.service';
import * as _ from 'lodash';
import { LobbyService } from 'src/app/services/lobby.service';

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

  constructor(private lobbyService: LobbyService, private authService: AuthService, private route: ActivatedRoute, private router: Router) { }

  lobby: Lobby | undefined
  refresh = true
  player_one: string | undefined
  player_two: string | undefined
  isRanked: string | undefined
  isPrivate: string | undefined
  username = ""
  name = ""

  ngOnInit(): void {
    this.route.params.subscribe(async params => {
      this.refreshLobbyState(params.id)
      this.username = this.authService.getUsername()
    })
  }
  ngOnDestroy(): void {
    this.refresh = false
  }

  get isPlayerOne(){
    return this.username == this.lobby?.player_one_username
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

  async changePrivacy() {
    if (this.lobby && this.username== this.lobby.player_one_username) {
      if(this.lobby.is_private){
        this.isPrivate = "Public"
        this.lobby.is_private = false
      }
      else{
        this.isPrivate = "Private"
        this.lobby.is_private = true
      }
      console.log(this.lobby)
      await this.lobbyService.updateLobby(this.lobby)
    }
  }

  async startGame() {
    if (this.lobby &&  this.player_one && this.player_two&& this.username== this.lobby.player_one_username) {
      await this.lobbyService.startGame(this.lobby.game_id, this.player_one, this.player_two, this.lobby.is_ranked)
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
    this.name = this.lobby.name
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

  getName() {
    return this.lobby?.name
  }

  async changeName(name: string){
    if(this.lobby){
      this.name = name
      this.lobby.name = name
      await this.lobbyService.updateLobby(this.lobby)
    }
  }

  onEnter(name: string) { this.changeName(name) }

}

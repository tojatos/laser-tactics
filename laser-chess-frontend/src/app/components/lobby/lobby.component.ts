import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { Lobby } from 'src/app/app.models';
import { LobbyService } from 'src/app/services/lobby.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit, OnDestroy {

  constructor(private lobbyService: LobbyService, private route: ActivatedRoute, private router: Router) { }

  lobby: Lobby | undefined
  refresh = true
  player_one: string | undefined
  player_two: string | undefined

  ngOnInit(): void {
    this.route.params.subscribe(async params => {
      this.refreshLobbyState(params.id)
    })
  }

  ngOnDestroy(): void {
    this.refresh = false
  }

  async changePlayers(){
    if (this.lobby) {
      this.lobby.starting_position_reversed = !this.lobby.starting_position_reversed
      await this.lobbyService.updateLobby(this.lobby)
    }
  }

  changePrivacy() {
    if (this.lobby) {
      this.lobby.is_private = true
      this.lobbyService.updateLobby(this.lobby)
    }
  }

  async startGame() {
    if (this.lobby &&  this.player_one && this.player_two) {
      await this.lobbyService.startGame(this.lobby.game_id, this.player_one, this.player_two)
      this.router.navigate(['/game', this.lobby.game_id])
    }

  }

  async refreshLobbyState(gameId: string){
    const lobbyData = await this.lobbyService.getLobbyById(gameId)
    this.lobby = lobbyData
    this.player_one = this.lobby.player_one_username
    this.player_two = this.lobby.player_two_username
    if(this.lobby?.starting_position_reversed){
      const p1 = this.player_one
      this.player_one = this.player_two
      this.player_two = p1
    }
    //console.log(this.lobby)
    if(this.refresh)
      window.setTimeout(() => this.refreshLobbyState(gameId), 500)
  }
}

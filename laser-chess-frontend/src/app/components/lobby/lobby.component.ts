import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Lobby } from 'src/app/app.models';
import { AuthService } from 'src/app/auth/auth.service';
import * as _ from 'lodash';
import { LobbyService } from 'src/app/services/lobby.service';
import { webSocket } from 'rxjs/webSocket';
import { environment } from 'src/environments/environment';

export enum LobbyStatus {
  CREATED = "CREATED",
  ABANDONED = "ABANDONED",
  GAME_STARTED = "GAME_STARTED",
  GAME_ENDED = "GAME_ENDED"
}

enum Times {
  ONE_MINUTE = "1 Min",
  FIVE_MINUTES = "5 Min",
  TEN_MINUTES = "10 Min",
  HALF_HOUR = "30 Min",
  HOUR = "60 Min"
}

function getByValue(map: Map<any, any>, searchValue: any) {
  for (let [key, value] of map.entries()) {
    if (value === searchValue)
      return key;
  }
}

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit, OnDestroy {

  constructor(private lobbyService: LobbyService, private authService: AuthService, private route: ActivatedRoute, private router: Router) { }

  lobbyId: string | undefined
  lobby: Lobby | undefined
  refresh = true
  player_one: string | undefined
  player_two: string | undefined
  isRanked: string | undefined
  isPrivate: string | undefined
  username = ""
  name = ""
  times1 = Object.values(Times)
  times2 = Object.values(Times)
  isTimed = false
  selectedTime1 = Times.FIVE_MINUTES
  selectedTime2 = Times.FIVE_MINUTES
  timesMap = new Map<Times, number>()

  ngOnInit() {
    this.timesMap.set(Times.ONE_MINUTE, 60)
    this.timesMap.set(Times.FIVE_MINUTES, 300)
    this.timesMap.set(Times.TEN_MINUTES, 600)
    this.timesMap.set(Times.HALF_HOUR, 1800)
    this.timesMap.set(Times.HOUR, 3600)

    this.route.params.subscribe(async params => {
      const lobby = await this.lobbyService.getLobbyById(params.id)
      this.refreshLobbyState(lobby)
      this.username = this.authService.getUsername()
      this.connectWebsocket(params.id)
    })
  }
  ngOnDestroy(): void {
    this.subject.complete()
  }

  private lastMessage: Lobby | undefined
  private subject = webSocket<Lobby | any>(environment.LOBBY_WEBSOCKET_URL)

  get lastWebsocketMessage(){
    return this.lastMessage
  }



  connectWebsocket(lobbyId: string){
    this.subject.asObservable().subscribe(
      msg => {
        if((<Lobby>msg).game_id)
          this.refreshLobbyState(msg)
      },
      err => {
        console.error(err)
      }
    )

    this.subject.next({ request: { game_id: lobbyId }} )
  }

  get isPlayerOne(){
    return this.username == this.lobby?.player_one_username
  }

  async changePlayers(){
    if (this.lobby && this.username == this.lobby.player_one_username) {
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
      await this.lobbyService.updateLobby(this.lobby)
    }
  }

  async changeTime(){
    if(this.lobby && this.username == this.lobby.player_one_username){
      this.lobby.is_timed = this.isTimed
      this.lobby.player_one_time = this.timesMap.get(this.selectedTime1) || -1
      this.lobby.player_two_time = this.timesMap.get(this.selectedTime2) || -1
      await this.lobbyService.updateLobby(this.lobby)
    }
  }

  async startGame() {
    if (this.lobby &&  this.player_one && this.player_two&& this.username== this.lobby.player_one_username) {
      await this.lobbyService.startGame(this.lobby.game_id, this.player_one, this.player_two, this.lobby.is_ranked, this.isTimed, this.timesMap.get(this.selectedTime1) || -1, this.timesMap.get(this.selectedTime2) || -1)
      this.router.navigate(['/game', this.lobby.game_id])
    }

  }

  leaveLobby() {
    if (this.lobby && (this.username== this.lobby.player_one_username ||this.username== this.lobby.player_two_username)){
    this.lobbyService.leaveLobby(this.lobby.game_id)
    this.router.navigate(['/'])
    }
  }

  async refreshLobbyState(lobby: Lobby){
    this.lobby = lobby
    if(this.lobby?.lobby_status == LobbyStatus.GAME_STARTED)
      this.router.navigate(['/game', this.lobby.game_id])

    this.isTimed = this.lobby.is_timed
    this.selectedTime1 = getByValue(this.timesMap, this.lobby.player_one_time)
    this.selectedTime2 = getByValue(this.timesMap, this.lobby.player_two_time)
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

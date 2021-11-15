import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { forEach } from 'lodash';
import { Lobby } from 'src/app/app.models';
import { AuthService } from 'src/app/auth/auth.service';
import { LobbyService } from 'src/app/services/lobby.service';

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
  public lobbies: Lobby[] | undefined
  displayedColumns = ['player_one_username', 'player_two_username', 'Mode', 'join'];

  constructor(private _liveAnnouncer: LiveAnnouncer, private authService: AuthService, private route: ActivatedRoute, private lobbyService: LobbyService, private router: Router) {}

  async ngOnInit() {
    this.dataSource.data = await this.lobbyService.getLobbies()
    this.dataSource.data.forEach(function(item, index, object) {
      if(item.is_private==true) 
      {
        object.splice(index, 1);
      }
    })
    this.fetched = true
  }

  openLobby(lobby: Lobby) {
    console.log(lobby)
    this.router.navigate(['/lobby', lobby.id])
  }

  joinLobby(lobby: Lobby) {
    this.lobbyService.joinLobby(lobby.id)
    this.router.navigate(['/lobby', lobby.id])
  }

  getMode(ranked: any) {
    if (ranked){
      return 'Ranked'
    }
    else{
      return 'Casual'
    }
  }

  async refreshList(){
    this.fetched = false
    this.dataSource.data = await this.lobbyService.getLobbies()
    this.dataSource.data.forEach(function(item, index, object) {
      if(item.is_private==true)
      {
        object.splice(index, 1);
      }
    })
    this.fetched = true
  }

  async createLobby(){
    this.lobby = await this.lobbyService.createLobby()
    console.log(this.lobby)
    this.router.navigate(['/lobby', this.lobby.id])
      }

  async createPrivateLobby(){
    this.lobby = await this.lobbyService.createLobby()
    this.lobby.is_private = true
    this.lobbyService.updateLobby(this.lobby)
    console.log(this.lobby)
    this.router.navigate(['/lobby', this.lobby.id])
      }

  async createRankedLobby(){
    this.lobby = await this.lobbyService.createLobby()
    this.lobby.is_ranked = true
    this.lobbyService.updateLobby(this.lobby)
    console.log(this.lobby)
    this.router.navigate(['/lobby', this.lobby.id])
      }

}

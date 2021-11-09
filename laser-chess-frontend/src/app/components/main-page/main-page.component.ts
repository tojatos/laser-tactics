import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
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

  public lobbies: Lobby[] | undefined
  displayedColumns = ['player_one_username', 'name', 'player_two_username', 'is_ranked'];

  constructor(private authService: AuthService, private route: ActivatedRoute, private lobbyService: LobbyService, private router: Router) {}

  async ngOnInit() {
    this.dataSource.data = await this.lobbyService.getLobbies()
    console.log(this.dataSource.data)
    this.fetched = true
  }
 
  getLobbies() {
       this.lobbyService.getLobbies().then(
          lobbies => { 
            console.log(lobbies)
             this.dataSource.data = lobbies}
        )
      }

  openLobby(lobby: Lobby) {
    console.log(lobby)
    this.router.navigate(['/lobby', lobby.id])
  }

  joinLobby(lobby: Lobby) {
    this.lobbyService.joinLobby(lobby.id)
    this.router.navigate(['/lobby', lobby.id])
  }

}

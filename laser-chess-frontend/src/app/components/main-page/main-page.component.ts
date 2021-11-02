import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
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

  constructor(private authService: AuthService, private route: ActivatedRoute, private lobbyService: LobbyService) {}

  async ngOnInit() {
    console.log("1")
    this.dataSource.data = await this.lobbyService.getlobbies()
    console.log(this.dataSource.data)
    this.fetched = true
    console.log("2")
  }
 
  getLobbies() {
       this.lobbyService.getlobbies().then(
          lobbies => { 
            console.log(lobbies)
             this.dataSource.data = lobbies}
        )
      }

}
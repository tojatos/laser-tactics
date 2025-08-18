import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
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
    styleUrls: ['./main-page.component.scss'],
    standalone: false
})
export class MainPageComponent implements OnInit {
  private _snackBar = inject(MatSnackBar);
  private _liveAnnouncer = inject(LiveAnnouncer);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private lobbyService = inject(LobbyService);
  private router = inject(Router);
  private userService = inject(UserService);

  dataSource = new MatTableDataSource<Lobby>();
  fetched = false;
  lobby: Lobby | undefined;
  ranked = false;
  verified = false;
  user: User | undefined;
  public lobbies: Lobby[] | undefined;
  displayedColumns = ['name', 'players', 'Mode', 'join'];
  errorMessage: string | null = null;
  
  // Game creation options
  isRanked = false;
  isPrivate = false;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  openSnackBar(message: string) {
    this._snackBar.open(message, '', {
      duration: 1000,
    });
  }

  get isLoggedin() {
    return this.authService.isLoggedIn();
  }

  async ngOnInit() {
    const shouldReturn = await this.checkAndRedirectToCurrentLobby();
    if (shouldReturn) {
      return;
    }

    try {
      this.errorMessage = null;
      const data = await this.lobbyService.getLobbies();
      this.dataSource.data = sortBy(
        data.filter(
          (res) =>
            !res.is_private &&
            res.lobby_status == LobbyStatus.CREATED &&
            new Date().getTime() - new Date(res.lobby_creation_date).getTime() < 3600000 * 8
        ),
        ['id']
      ).slice(-8);
      this.fetched = true;
      if (this.isLoggedin) {
        this.userService.getUserMe().then((userData) => {
          this.user = userData;
          this.verified = this.user.is_verified!;
        });
      }
    } catch (e) {
      this.errorMessage = 'Server temporarily unavailable';
      this.dataSource.data = [];
      this.fetched = false;
    }
  }

  private async checkAndRedirectToCurrentLobby(): Promise<boolean> {
    if (!this.isLoggedin) {
      return false;
    }

    try {
      const currentLobby = await this.lobbyService.getCurrentLobby();
      if (currentLobby?.game_id) {
        this.router.navigate(['/lobby', currentLobby.game_id]);
        return true;
      }
    } catch (e) {
      console.warn('Could not check current lobby status:', e);
    }

    return false;
  }

  openLobby(lobby: Lobby) {
    this.router.navigate(['/lobby', lobby.game_id]);
  }

  joinLobby(lobby: Lobby) {
    this.lobbyService.joinLobby(lobby.game_id);
    this.router.navigate(['/lobby', lobby.game_id]);
  }

  getMode(ranked: any) {
    if (ranked) {
      return 'Ranked';
    } else {
      return 'Casual';
    }
  }
  getVerified() {
    this.userService.getUserMe().then((userData) => {
      this.user = userData;
    });
    return this.user?.is_verified;
  }

  async refreshList() {
    this.fetched = false;
    try {
      this.errorMessage = null;
      const data = await this.lobbyService.getLobbies();
      this.dataSource.data = sortBy(
        data.filter(
          (res) =>
            !res.is_private &&
            res.lobby_status == LobbyStatus.CREATED &&
            new Date().getTime() - new Date(res.lobby_creation_date).getTime() < 3600000 * 4
        ),
        ['id']
      ).slice(-8);
      this.fetched = true;
    } catch (e) {
      this.errorMessage = 'Server temporarily unavailable';
      this.dataSource.data = [];
      this.fetched = false;
    }
  }

  async createGameWithOptions() {
    this.lobby = await this.lobbyService.createLobby();
    
    if (this.isRanked || this.isPrivate) {
      if (this.isRanked) {
        this.lobby.is_ranked = true;
      }
      if (this.isPrivate) {
        this.lobby.is_private = true;
      }
      this.lobbyService.updateLobby(this.lobby);
    }
    
    this.router.navigate(['/lobby', this.lobby.game_id]);
  }

  sendVerifyEmail() {
    this.openSnackBar('Email sent');
    this.authService.sendVerficationMail(this.authService.getUsername());
  }

  getRedPlayer(lobby: Lobby): string | null {
    if (!lobby.starting_position_reversed) {
      return lobby.player_one_username || null;
    } else {
      return lobby.player_two_username || null;
    }
  }

  getBluePlayer(lobby: Lobby): string | null {
    if (!lobby.starting_position_reversed) {
      return lobby.player_two_username || null;
    } else {
      return lobby.player_one_username || null;
    }
  }

  hasRedPlayer(lobby: Lobby): boolean {
   return this.getRedPlayer(lobby) !== null;
  }

  hasBluePlayer(lobby: Lobby): boolean {
    return this.getBluePlayer(lobby) !== null;
  }
}

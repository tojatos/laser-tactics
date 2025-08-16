import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Ranking } from 'src/app/app.models';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-ranking',
    templateUrl: './ranking.component.html',
    styleUrls: ['./ranking.component.scss'],
    standalone: false
})
export class RankingComponent implements OnInit {
  public topRanking: Ranking[] | undefined;
  displayedColumns = ['position', 'username', 'rating'];
  dataSource = new MatTableDataSource<Ranking>();
  fetched = false;
  errorMessage: string | null = null;

  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  async ngOnInit() {
    try {
      this.errorMessage = null;
      const data = await this.userService.getTopRanking();
      this.dataSource.data = data.splice(0, 10);
      this.fetched = true;
    } catch (e) {
      this.errorMessage = 'Server temporarily unavailable';
      this.dataSource.data = [];
      this.fetched = false;
    }
  }

  openProfile(user: Ranking) {
    this.router.navigate(['/users', user.username]);
  }
}

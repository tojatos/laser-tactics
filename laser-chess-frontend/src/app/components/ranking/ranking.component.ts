import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Ranking } from 'src/app/app.models';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.scss']
})
export class RankingComponent implements OnInit {

  public topRanking: Ranking[] | undefined
  displayedColumns = ['position', 'username', 'rating'];
  dataSource = new MatTableDataSource<Ranking>();
  fetched = false
  
  constructor(private router: Router, private userService: UserService) { }

  async ngOnInit() {
    const data = await this.userService.getTopRanking()
    this.dataSource.data = data
    this.fetched = true
  }

  openProfile(user: Ranking) {
    console.log(user)
    this.router.navigate(['/users', user.username])
  }

}

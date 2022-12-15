import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
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
  allData: Ranking[] = []

  form = new FormGroup({
    input: new FormControl('')
  });

  constructor(private router: Router, private userService: UserService) { }

  async ngOnInit() {
    const data = await this.fetchRankingData()
    this.dataSource.data = data.splice(0, 10)
  }

  openProfile(user: Ranking) {
    this.router.navigate(['/users', user.username])
  }

  async fetchRankingData(){
    this.fetched = false
    const data = await this.userService.getTopRanking()
    this.allData = JSON.parse(JSON.stringify(data))
    this.fetched = true
    return data
  }

  async onSubmit() {
    if (this.form.value.input) {
      const search = this.form.value.input
      const data = this.allData.find(d => d.username == search)
      this.dataSource.data = data ? [data] : []
      this.fetched = true
    }
    else{
      const data = await this.fetchRankingData()
      this.dataSource.data = data.splice(0, 10)
    }
  }

}

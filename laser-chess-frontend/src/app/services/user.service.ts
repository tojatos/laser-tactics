import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../app.models';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  getUserByUsername(username: string) {
    return this.http.get<User>(`api/v1/user/${username}`).toPromise()
  }

  getUserMe() {
    return this.http.get<User>('api/v1/users/me/').toPromise()
  }

}

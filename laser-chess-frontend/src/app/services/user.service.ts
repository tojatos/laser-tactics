import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { userFullEndpoint } from '../api-definitions';
import { User } from '../app.models';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  getUserByUsername(username: string) {
    return this.http.get<User>(userFullEndpoint(username)).toPromise()
  }

  getUserMe() {
    return this.http.get<User>(userFullEndpoint("me")).toPromise()
  }

}

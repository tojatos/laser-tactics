import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Injectable, SkipSelf } from '@angular/core';
import { UserToken } from '../app.models';
import * as moment from "moment"

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  async login(login:string, pass:string): Promise<UserToken> {
    const promise = new Promise<UserToken>((resolve, reject) => {
      resolve({tokenID: "123", expiresIn: "222222"})
    })
    return promise.then(res => this.setSession(res))
    //return this.http.post<UserToken>('/api/login', {login, pass}).toPromise().then(res => this.setSession(res))
  }

  private setSession(authResult: UserToken) {
    const expiresAt = moment().add(authResult.expiresIn,'second')
    console.log(expiresAt)

    localStorage.setItem('id_token', authResult.tokenID)
    localStorage.setItem("expires_at", JSON.stringify(expiresAt.valueOf()) )
    return authResult
}

}

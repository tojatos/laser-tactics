import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserToken } from '../app.models';
// import * as moment from "moment"

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  idToken = 'access_token'

  constructor(private http: HttpClient) {}

  async login(login:string, pass:string): Promise<UserToken> {
    let options = {
      headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
    }

    let body = new URLSearchParams()
    body.set('username', login)
    body.set('password', pass)

    return this.http.post<UserToken>('/api/v1/token', body.toString(), options).toPromise().then(res => this.setSession(res))
  }

private setSession(authResult: UserToken) {
    // const expiresAt = moment().add(authResult.expiresIn,'second')
    localStorage.setItem(this.idToken, authResult.access_token)
    // localStorage.setItem("expires_at", JSON.stringify(expiresAt.valueOf()) )
    return authResult
}

clearJWT(){
    localStorage.removeItem(this.idToken)
    // localStorage.removeItem("expires_at")
}

isLoggedIn(){
  return localStorage.getItem(this.idToken) != null
}

}

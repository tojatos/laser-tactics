import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tokenPayload, UserToken } from '../app.models';
import { JwtHelperService } from '@auth0/angular-jwt';
// import * as moment from "moment"

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  idToken = 'access_token'

  constructor(private http: HttpClient, private jwtHelper: JwtHelperService) {}

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

parseJWT(jwt: string | undefined){
  return this.jwtHelper.decodeToken<tokenPayload>(jwt)
}

getCurrentJwtInfo(){
  const jwt = localStorage.getItem('access_token')
  return this.parseJWT(jwt || undefined)
}

clearJWT(){
    localStorage.removeItem(this.idToken)
    // localStorage.removeItem("expires_at")
}

isLoggedIn(){
  return localStorage.getItem(this.idToken) != null
}

}

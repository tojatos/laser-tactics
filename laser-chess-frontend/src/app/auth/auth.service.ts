import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { tokenPayload, UserToken } from '../app.models';
import { JwtHelperService } from '@auth0/angular-jwt';
import {
  tokenFullEndpoint,
  usersFullEndpoint,
  userFullEndpoint,
  emailFullEndpoint,
} from '../api-definitions';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private jwtHelper = inject(JwtHelperService);
  private router = inject(Router);

  idToken = 'access_token';

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  async login(login: string, pass: string): Promise<UserToken> {
    const options = {
      headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded'),
    };

    const body = new URLSearchParams();
    body.set('username', login);
    body.set('password', pass);

    return this.http
      .post<UserToken>(tokenFullEndpoint, body.toString(), options)
      .toPromise()
      .then((res) => this.setSession(res));
  }

  register(login: string, email: string, pass: string) {
    return this.http
      .post<any>(usersFullEndpoint, { username: login, email: email, password: pass })
      .toPromise();
  }

  changePassword(token: string, newPassword: string) {
    return this.http
      .post<any>(userFullEndpoint('changePassword'), { token: token, newPassword: newPassword })
      .toPromise();
  }

  sendVerficationMail(username: string) {
    return this.http
      .post<any>(emailFullEndpoint('send_verification_email'), { username: username })
      .toPromise();
  }

  sendPasswordChangeRequest(email: string) {
    return this.http
      .post<any>(emailFullEndpoint('send_password_change_request'), { email: email })
      .toPromise();
  }

  verifyUser(token: string) {
    return this.http.post<any>(userFullEndpoint(`verify/${token}`), {}).toPromise();
  }

  private setSession(authResult: UserToken) {
    // const expiresAt = moment().add(authResult.expiresIn,'second')
    localStorage.setItem(this.idToken, authResult.access_token);
    // localStorage.setItem("expires_at", JSON.stringify(expiresAt.valueOf()) )
    return authResult;
  }

  parseJWT(jwt: string | undefined) {
    return this.jwtHelper.decodeToken<tokenPayload>(jwt);
  }

  get jwt() {
    return localStorage.getItem('access_token');
  }

  getCurrentJwtInfo() {
    const jwt = localStorage.getItem('access_token');
    return jwt ? this.parseJWT(jwt) : undefined;
  }

  clearJWT() {
    localStorage.removeItem(this.idToken);
    // localStorage.removeItem("expires_at")
  }

  isLoggedIn() {
    return localStorage.getItem(this.idToken) != null;
  }

  getUsername() {
    if (localStorage.getItem(this.idToken) != null) {
      return this.getCurrentJwtInfo()!.sub;
    } else {
      return '';
    }
  }

  logout() {
    this.clearJWT();
    this.router.navigate(['/']);
  }
}

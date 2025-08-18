import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { friendsFullEndpoint, settingsFullEndpoint, userFullEndpoint } from '../api-definitions';
import { FriendRequest, Ranking, Settings, User, UserHistory } from '../app.models';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  changePassword(oldPassword: string, newPassword: string) {
    return this.http
      .post<any>(userFullEndpoint('me/change_password'), {
        oldPassword: oldPassword,
        newPassword: newPassword,
      })
      .toPromise();
  }

  changePasswordWithToken(token: string, newPassword: string) {
    return this.http
      .post<any>(userFullEndpoint('change_password'), { token: token, newPassword: newPassword })
      .toPromise();
  }

  getUserByUsername(username: string | undefined) {
    if (username) return this.http.get<User>(userFullEndpoint(username)).toPromise();
    return undefined;
  }


  getUserMe(): Promise<User> {
    return this.http.get<User>(userFullEndpoint('me/info')).toPromise();
  }

  getSettings() {
    return this.http.get<Settings>(settingsFullEndpoint);
  }

  updateSettings(settings: Settings) {
    return this.http.patch<Settings>(settingsFullEndpoint, settings).toPromise();
  }

  getUserFriends() {
    return this.http.get<any>(friendsFullEndpoint()).toPromise();
  }

  getUserFriendsRequests() {
    return this.http.get<FriendRequest[]>(friendsFullEndpoint('requests')).toPromise();
  }

  sendFriendRequests(username: string) {
    return this.http
      .post<any>(friendsFullEndpoint('requests/send'), { username: username })
      .toPromise();
  }
  acceptFriendRequests(id: string) {
    return this.http.post<any>(friendsFullEndpoint('requests/accept'), { id: id }).toPromise();
  }

  declineFriendRequests(id: string) {
    return this.http.post<any>(friendsFullEndpoint('requests/decline'), { id: id }).toPromise();
  }

  removeFriend(username: string) {
    return this.http
      .delete(friendsFullEndpoint('unfriend'), { body: { username: username } })
      .subscribe();
  }

  getBlockedUsers() {
    return this.http.get<any>(userFullEndpoint('me/blocked')).toPromise();
  }

  blockUser(username: string) {
    return this.http.post<any>(userFullEndpoint('me/block'), { username: username }).toPromise();
  }

  unblockUser(username: string) {
    return this.http
      .delete(userFullEndpoint('me/unblock'), { body: { username: username } })
      .subscribe();
  }

  getUserStats(username: string) {
    return this.http.get<any>(userFullEndpoint(`${username}/stats`)).toPromise();
  }

  getUserGameHistory(username: string) {
    return this.http.get<UserHistory[]>(userFullEndpoint(`${username}/history`)).toPromise();
  }

  getTopRanking() {
    return this.http.get<Ranking[]>(userFullEndpoint('ranking/top')).toPromise();
  }
}

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { friendsFullEndpoint, userFullEndpoint, usersFullEndpoint } from '../api-definitions';
import { FriendRequest, User } from '../app.models';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  changePassword(oldPassword: string, newPassword: string){
    return this.http.post<any>(userFullEndpoint("me/change_password"), {'oldPassword': oldPassword, 'newPassword': newPassword}).toPromise()
  }

  getUserByUsername(username: string) {
    return this.http.get<User>(userFullEndpoint(username)).toPromise()
  }

  getUserMe() {
    return this.http.get<User>(userFullEndpoint("me")).toPromise()
  }

  getUserFriends() {
    return this.http.get<any>(friendsFullEndpoint()).toPromise()
  }

  getUserFriendsRequests() {
    return this.http.get<FriendRequest[]>(friendsFullEndpoint("requests")).toPromise()
  }

  sendFriendRequests(username: string) {
    return this.http.post<any>(friendsFullEndpoint("requests/send"), {'username':username}).toPromise()
  }
  acceptFriendRequests(id: string) {
    return this.http.post<any>(friendsFullEndpoint("requests/accept"), {'id': id}).toPromise()
  }

  declineFriendRequests(id: string) {
    return this.http.post<any>(friendsFullEndpoint("requests/decline"),{'id': id}).toPromise()
  }

  removeFriend(username: string) {
    return this.http.delete(friendsFullEndpoint("unfriend"),{body:{'username': username}}).subscribe()
  }

  getBlockedUsers() {
    return this.http.get<any>(friendsFullEndpoint("me/blocked")).toPromise()
  }

  blockUser(username: string) {
    return this.http.post<any>(userFullEndpoint("block"),{'username': username}).toPromise()
  }

  unblockUser(username: string) {
    return this.http.delete(userFullEndpoint("unblock"),{body:{'username': username}}).subscribe()
  }

  getUserStats(username: string) {
    return this.http.get<any>(userFullEndpoint(`${username}/stats`)).toPromise()
  }

  // getUserGameHistory(username: string) {
  //   return this.http.get<any>(userFullEndpoint(`${username}/history `).toPromise()
  // }


}

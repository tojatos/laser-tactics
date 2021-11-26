import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { friendsFullEndpoint, settingsFullEndpoint, userFullEndpoint } from '../api-definitions';
import { User, Settings } from '../app.models';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  getUserByUsername(username: string) {
    return this.http.get<User>(userFullEndpoint(username)).toPromise()
  }

  getUserMe() {
    return this.http.get<User>(userFullEndpoint("me/")).toPromise()
  }

  getUserFriends() {
    return this.http.get<any>(friendsFullEndpoint()).toPromise()
  }

  getUserFriendsRequests() {
    return this.http.get<any>(friendsFullEndpoint("requests")).toPromise()
  }

  sendFriendRequests(friend_username: string) {
    return this.http.post<any>(friendsFullEndpoint("requests/send"), {'friend_username':friend_username}).toPromise()
  }
  acceptFriendRequests(request_id: number) {
    return this.http.post<any>(friendsFullEndpoint("requests/accept"), {'request_id': request_id}).toPromise()
  }

  declineFriendRequests(request_id: number) {
    return this.http.post<any>(friendsFullEndpoint("requests/decline"),{'request_id': request_id}).toPromise()
  }

  getSettings(){
    return this.http.get<Settings>(settingsFullEndpoint)
  }

  removeFriend() {
    return this.http.delete<any>(friendsFullEndpoint("unfriend")).toPromise()
  }

  getBlockedUsers() {
    return this.http.get<any>(friendsFullEndpoint("me/blocked")).toPromise()
  }

  blockUser(username: string) {
    return this.http.post<any>(userFullEndpoint(`${username}/block`),{}).toPromise()
  }

  unblockUser(username: string) {
    return this.http.delete<any>(userFullEndpoint(`${username}/unblock`)).toPromise()
  }

}

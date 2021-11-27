import { LobbyStatus } from "./components/lobby/lobby.component";

export interface UserToken{
  access_token: string,
  token_type: string,
}

export interface tokenPayload {
  sub: string,
  exp: number
}

export interface Lobby {
  id: string,
  game_id: string,
  name: string,
  player_one_username: string,
  player_two_username: string,
  is_ranked: boolean,
  is_private: boolean,
  starting_position_reversed: boolean,
  lobby_status: LobbyStatus
}

export interface Item {
  title: string,
  description: string,
  id: number,
  owner_id: number
}

export interface User {
  username: string,
  email: string,
  id: number,
  is_active: boolean,
  items: Item[]
}

export interface FriendRequest {
  id: string,
  user_one_username: string,
  user_two_username: number,
  status: RequestStatus
}

export enum RequestStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  DECLINED = "DECLINED"
}

export interface UserStats {
  drawrate: number,
  draws: number,
  loses: number,
  matches: number,
  winrate: number,
  winrate_as_p1: number,
  winrate_as_p2: number,
  wins: number,
}

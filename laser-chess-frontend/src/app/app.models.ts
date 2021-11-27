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
  lobby_status: LobbyStatus,
  lobby_creation_date: string
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
  is_active: boolean,
  is_verified: boolean,
  registration_date: string,
  rating: number
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
export interface Settings {
  skip_animations: boolean
}

export interface UserHistory {
  is_rated: boolean,
  id: number,
  player_two_new_rating: number | null,
  game_id: string,
  player_one_rating: number | null,
  player_one_volatility: number | null,
  player_two_rating: number | null,
  player_two_volatility: number | null,
  game_end_date: string | null,
  player_one_new_rating: number | null,
  player_one_username: string | null,
  player_one_deviation: number | null,
  player_two_username: string | null,
  player_two_deviation: number | null,
  result: string | null,
}

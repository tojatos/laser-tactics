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
  gameId: string,
  name: string,
  player_one_username: string,
  player_two_username: string,
  is_ranked: boolean,
  is_private: boolean
}

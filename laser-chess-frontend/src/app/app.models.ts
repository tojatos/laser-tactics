export interface UserToken{
  access_token: string,
  token_type: string,
}

export interface tokenPayload {
  sub: string,
  exp: number
}

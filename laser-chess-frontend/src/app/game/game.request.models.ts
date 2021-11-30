import { Coordinates } from "./game.models";

export interface StartGameRequest {
  game_id: string,
  player_one_id: string,
  player_two_id: string,
  is_rated: boolean
}

export interface MovePieceRequest {
  game_id: string,
  move_from: Coordinates,
  move_to: Coordinates
}

export interface RotatePieceRequest {
  game_id: string,
  rotate_at: Coordinates,
  angle: number
}

export interface ShootRequest {
  game_id: string
}

export interface ErrorResponse {
  detail: string
}

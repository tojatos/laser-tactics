import { Coordinates } from "./game.models";

export interface StartGameRequest {
  game_id: string,
  player_one_id: string,
  player_two_id: string
}

export interface MovePieceRequest {
  game_id: string,
  move_from: Coordinates,
  move_to: Coordinates
}

export interface ShootRequest {
  game_id: string
}

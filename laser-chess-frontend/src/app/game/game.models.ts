import { PieceType } from "./src/enums";

export type GameEvent = PieceRotatedEvent | PieceMovedEvent | TeleportEvent | LaserShotEvent | TakeEvent

export interface GameState {
  player_one_id: string,
  player_two_id: string,
  board: BoardInterface,
  is_started: boolean,
  turn_number: number,
  game_events: GameEvent[]
}

export interface BoardInterface {
  cells: Array<CellInterface>
}

export interface CellInterface {
  coordinates: Coordinates,
  piece: PieceInterface | null
}

export interface Coordinates {
  x: number,
  y: number
}

export interface PieceInterface {
  piece_type: string,
  piece_owner: string,
  rotation_degree: number
}

export interface PieceRotatedEvent {
  kind: "rotation"
  rotated_piece_at: Coordinates
  rotation: number
}

export interface PieceMovedEvent {
  kind: "move"
  moved_from: Coordinates
  moved_to: Coordinates
}

export interface TeleportEvent {
  kind: "teleportation"
  teleported_from: Coordinates
  teleported_to: Coordinates
}

export interface LaserShotEvent {
  kind: "laser"
  laser_path: LaserShotEventEntity[]
}

export interface TakeEvent {
  kind: "take"
  taken_on: Coordinates,
  piece_that_took_type: PieceType,
  piece_taken_type: PieceType
}

export interface LaserShotEventEntity {
  time: number,
  coordinates: Coordinates
}


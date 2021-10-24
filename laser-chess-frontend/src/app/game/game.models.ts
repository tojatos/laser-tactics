import { GameEvents, GamePhase, PieceType } from "./src/enums";

export type GameEvent = PieceRotatedEvent | PieceMovedEvent | TeleportEvent | LaserShotEvent | TakeEvent

export interface GameState {
  game_id: string
  player_one_id: string
  player_two_id: string
  board: BoardInterface
  game_phase: GamePhase
  turn_number: number
  game_events: GameEvent[]
}

export interface BoardInterface {
  cells: Array<CellInterface>
}

export interface CellInterface {
  coordinates: Coordinates
  piece: PieceInterface | null
  auxiliaryPiece: PieceInterface | null
}

export interface Coordinates {
  x: number
  y: number
}

export interface PieceInterface {
  piece_type: PieceType
  piece_owner: string
  rotation_degree: number
}

export interface PieceRotatedEvent {
  event_type: GameEvents.PIECE_ROTATED_EVENT
  rotated_piece_at: Coordinates
  rotation: number
}

export interface PieceMovedEvent {
  event_type: GameEvents.PIECE_MOVED_EVENT
  moved_from: Coordinates
  moved_to: Coordinates
}

export interface TeleportEvent {
  event_type: GameEvents.TELEPORT_EVENT
  teleported_from: Coordinates
  teleported_to: Coordinates
}

export interface LaserShotEvent {
  event_type: GameEvents.LASER_SHOT_EVENT
  laser_path: LaserShotEventEntity[]
}

export interface TakeEvent {
  event_type: GameEvents.PIECE_TAKEN_EVENT
  taken_on: Coordinates
  piece_that_took_type: PieceType
  piece_taken_type: PieceType
}

export interface LaserShotEventEntity {
  time: number,
  coordinates: Coordinates
}


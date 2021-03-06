import { GameEvents, GamePhase, PieceType } from "./src/Utils/Enums";

export type GameEvent = PieceRotatedEvent | PieceMovedEvent | TeleportEvent | LaserShotEvent | TakeEvent | PieceDestroyedEvent | DrawEvent | GiveUpEvent | TimeoutEvent
export type UserEvent = PieceRotatedEvent | PieceMovedEvent | LaserShotEvent | DrawEvent | GiveUpEvent | TimeoutEvent

export interface GameState {
  game_id: string
  player_one_id: string
  player_two_id: string
  player_one_time_left: number
  player_two_time_left: number
  board: BoardInterface
  game_phase: GamePhase
  turn_number: number
  is_rated: boolean
  is_timed: boolean
  game_events: GameEvent[]
  user_events: UserEvent[]
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

export interface TimeoutEvent {
  event_type: GameEvents.TIMEOUT_EVENT
  player_nr: number
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

export interface PieceDestroyedEvent {
  destroyed_on: Coordinates
  event_type: GameEvents.PIECE_DESTROYED_EVENT
  piece_destroyed: PieceInterface
  laser_destroy_time: number
}

export interface LaserShotEventEntity {
  time: number,
  coordinates: Coordinates
}

export interface GiveUpEvent {
  player: string,
  event_type: GameEvents.GIVE_UP_EVENT
}

export interface DrawEvent {
  player: string,
  event_type: GameEvents.OFFER_DRAW_EVENT
}

export interface ChatMessage {
  username: string,
  payload: string
}

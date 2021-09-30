export interface GameState {
  player_one_id: string,
  player_two_id: string,
  board: BoardInterface,
  is_started: boolean,
  turn_number: number,
  game_events: [PieceRotatedEvent | PieceMovedEvent | TeleportEvent | LaserShotEvent]
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
  rotated_piece_at: Coordinates
  rotation: number
}

export interface PieceMovedEvent {
  moved_from: Coordinates
  moved_to: Coordinates
}

export interface TeleportEvent {
  teleported_from: Coordinates
  teleported_to: Coordinates
}

export interface LaserShotEvent {
  laser_path: [LaserShotEventEntity]
}

export interface LaserShotEventEntity {
  time: number,
  coordinates: Coordinates
}


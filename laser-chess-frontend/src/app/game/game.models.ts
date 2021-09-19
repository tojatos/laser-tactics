export interface GameState {
  player_one_id: string,
  player_two_id: string,
  board: BoardInterface,
  is_started: boolean,
  turn_number: number
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


export interface GameState {
  player_one_id: String,
  player_two_id: String,
  board: Board,
  is_started: boolean,
  turn_number: Number
}

export interface Board {
  cells: Array<Cell>
}

export interface Cell {
  coordinates: CellCoordinates,
  piece: PieceInterface
}

export interface CellCoordinates {
  x: Number,
  y: Number
}

export interface PieceInterface {
  piece_type: String,
  piece_owner: String,
  rotation_degree: Number
}


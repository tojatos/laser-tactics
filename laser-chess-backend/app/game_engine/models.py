from dataclasses import dataclass
from enum import Enum, auto
from typing import Dict, List, Optional, Tuple, NewType

CellCoordinates = NewType('CellCoordinates', Tuple[int, int])

class PieceType(str, Enum):
    BEAM_SPLITTER = auto()
    BLOCK = auto()
    DIAGONAL_MIRROR = auto()
    HYPER_CUBE = auto()
    HYPER_SQUARE = auto()
    KING = auto()
    LASER = auto()
    MIRROR = auto()
    TRIANGULAR_MIRROR = auto()


class Player(str, Enum):
    PLAYER_ONE = auto()
    PLAYER_TWO = auto()
    NONE = auto()


@dataclass
class Piece:
    piece_type: PieceType
    piece_owner: Player
    rotation_degree: int = 0


@dataclass
class Cell:
    coordinates: CellCoordinates
    piece: Optional[Piece] = None


@dataclass
class BoardSerializable:
    cells: List[Cell]


@dataclass
class Board:
    cells: Dict[CellCoordinates, Optional[Piece]]

    def to_serializable(self) -> BoardSerializable:
        cells_transformed = [Cell(coordinates, piece) for coordinates, piece in self.cells.items()]
        return BoardSerializable(cells_transformed)


@dataclass
class GameStateSerializable:
    player_one_id: str
    player_two_id: str
    board: BoardSerializable
    is_started: bool
    turn_number: int


@dataclass
class GameState:
    player_one_id: str
    player_two_id: str
    board: Board
    is_started: bool
    turn_number: int

    def to_serializable(self) -> GameStateSerializable:
        return GameStateSerializable(
            player_one_id=self.player_one_id,
            player_two_id=self.player_two_id,
            board=self.board.to_serializable(),
            is_started=self.is_started,
            turn_number=self.turn_number,
        )



def empty_game_state(player_one_id, player_two_id) -> GameState:
    board: Board = Board(cells={
        (0, 0): Piece(PieceType.TRIANGULAR_MIRROR, Player.PLAYER_ONE),
        (1, 0): Piece(PieceType.TRIANGULAR_MIRROR, Player.PLAYER_ONE),
        (2, 0): Piece(PieceType.DIAGONAL_MIRROR, Player.PLAYER_ONE),
        (3, 0): Piece(PieceType.HYPER_CUBE, Player.PLAYER_ONE),
        (4, 0): Piece(PieceType.KING, Player.PLAYER_ONE),
        (5, 0): Piece(PieceType.LASER, Player.PLAYER_ONE),
        (6, 0): Piece(PieceType.DIAGONAL_MIRROR, Player.PLAYER_ONE, 90),
        (7, 0): Piece(PieceType.TRIANGULAR_MIRROR, Player.PLAYER_ONE, 270),
        (8, 0): Piece(PieceType.TRIANGULAR_MIRROR, Player.PLAYER_ONE, 270),

        (0, 1): Piece(PieceType.TRIANGULAR_MIRROR, Player.PLAYER_ONE, 270),
        (1, 1): Piece(PieceType.BLOCK, Player.PLAYER_ONE),
        (2, 1): Piece(PieceType.BLOCK, Player.PLAYER_ONE),
        (3, 1): Piece(PieceType.MIRROR, Player.PLAYER_ONE),
        (4, 1): Piece(PieceType.MIRROR, Player.PLAYER_ONE, 90),
        (5, 1): Piece(PieceType.BEAM_SPLITTER, Player.PLAYER_ONE),
        (6, 1): Piece(PieceType.BLOCK, Player.PLAYER_ONE),
        (7, 1): Piece(PieceType.BLOCK, Player.PLAYER_ONE),
        (8, 1): Piece(PieceType.TRIANGULAR_MIRROR, Player.PLAYER_ONE),

        (0, 2): None,
        (1, 2): None,
        (2, 2): None,
        (3, 2): None,
        (4, 2): None,
        (5, 2): None,
        (6, 2): None,
        (7, 2): None,
        (8, 2): None,

        (0, 3): None,
        (1, 3): None,
        (2, 3): None,
        (3, 3): None,
        (4, 3): None,
        (5, 3): None,
        (6, 3): None,
        (7, 3): None,
        (8, 3): None,

        (0, 4): None,
        (1, 4): None,
        (2, 4): None,
        (3, 4): None,
        (4, 4): Piece(PieceType.HYPER_SQUARE, Player.NONE),
        (5, 4): None,
        (6, 4): None,
        (7, 4): None,
        (8, 4): None,

        (0, 5): None,
        (1, 5): None,
        (2, 5): None,
        (3, 5): None,
        (4, 5): None,
        (5, 5): None,
        (6, 5): None,
        (7, 5): None,
        (8, 5): None,

        (0, 6): None,
        (1, 6): None,
        (2, 6): None,
        (3, 6): None,
        (4, 6): None,
        (5, 6): None,
        (6, 6): None,
        (7, 6): None,
        (8, 6): None,

        (0, 7): Piece(PieceType.TRIANGULAR_MIRROR, Player.PLAYER_TWO, 180),
        (1, 7): Piece(PieceType.BLOCK, Player.PLAYER_TWO, 180),
        (2, 7): Piece(PieceType.BLOCK, Player.PLAYER_TWO, 180),
        (3, 7): Piece(PieceType.BEAM_SPLITTER, Player.PLAYER_TWO, 180),
        (4, 7): Piece(PieceType.MIRROR, Player.PLAYER_TWO, 90),
        (5, 7): Piece(PieceType.MIRROR, Player.PLAYER_TWO),
        (6, 7): Piece(PieceType.BLOCK, Player.PLAYER_TWO, 180),
        (7, 7): Piece(PieceType.BLOCK, Player.PLAYER_TWO, 180),
        (8, 7): Piece(PieceType.TRIANGULAR_MIRROR, Player.PLAYER_TWO, 90),

        (0, 8): Piece(PieceType.TRIANGULAR_MIRROR, Player.PLAYER_TWO, 90),
        (1, 8): Piece(PieceType.TRIANGULAR_MIRROR, Player.PLAYER_TWO, 90),
        (2, 8): Piece(PieceType.DIAGONAL_MIRROR, Player.PLAYER_TWO, 90),
        (3, 8): Piece(PieceType.LASER, Player.PLAYER_TWO),
        (4, 8): Piece(PieceType.KING, Player.PLAYER_TWO),
        (5, 8): Piece(PieceType.HYPER_CUBE, Player.PLAYER_TWO),
        (6, 8): Piece(PieceType.DIAGONAL_MIRROR, Player.PLAYER_TWO),
        (7, 8): Piece(PieceType.TRIANGULAR_MIRROR, Player.PLAYER_TWO, 180),
        (8, 8): Piece(PieceType.TRIANGULAR_MIRROR, Player.PLAYER_TWO, 180),
    })
    is_started: bool = False
    turn_number: int = 0

    return GameState(player_one_id, player_two_id, board, is_started, turn_number)

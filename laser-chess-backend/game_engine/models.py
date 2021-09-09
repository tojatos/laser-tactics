import string
from dataclasses import dataclass
from enum import Enum, auto
from typing import List, Optional


@dataclass(frozen=True)
class CellCoordinates:
    x: int
    y: int


class PieceType(Enum):
    BEAM_SPLITTER = auto()
    BLOCK = auto()
    DIAGONAL_MIRROR = auto()
    HYPER_CUBE = auto()
    HYPER_SQUARE = auto()
    KING = auto()
    LASER = auto()
    MIRROR = auto()
    TRIANGULAR_MIRROR = auto()


class Player(Enum):
    PLAYER_ONE = auto()
    PLAYER_TWO = auto()
    NONE = auto()


@dataclass(frozen=True)
class Piece:
    piece_type: PieceType
    piece_owner: Player
    rotation_degree: int = 0


@dataclass(frozen=True)
class Cell:
    coordinates: CellCoordinates
    piece: Optional[Piece] = None


@dataclass(frozen=True)
class Board:
    cells: List[Cell]


# @dataclass(frozen=True)
@dataclass
class GameState:
    player_ids: (string, string)
    # history: List[Action] = []
    board: Board = Board(
        [
            Cell(CellCoordinates(0, 0), Piece(PieceType.TRIANGULAR_MIRROR, Player.PLAYER_ONE)),
            Cell(CellCoordinates(1, 0), Piece(PieceType.TRIANGULAR_MIRROR, Player.PLAYER_ONE)),
            Cell(CellCoordinates(2, 0), Piece(PieceType.DIAGONAL_MIRROR, Player.PLAYER_ONE)),
            Cell(CellCoordinates(3, 0), Piece(PieceType.HYPER_CUBE, Player.PLAYER_ONE)),
            Cell(CellCoordinates(4, 0), Piece(PieceType.KING, Player.PLAYER_ONE)),
            Cell(CellCoordinates(5, 0), Piece(PieceType.LASER, Player.PLAYER_ONE)),
            Cell(CellCoordinates(6, 0), Piece(PieceType.DIAGONAL_MIRROR, Player.PLAYER_ONE, 90)),
            Cell(CellCoordinates(7, 0), Piece(PieceType.TRIANGULAR_MIRROR, Player.PLAYER_ONE, 270)),
            Cell(CellCoordinates(8, 0), Piece(PieceType.TRIANGULAR_MIRROR, Player.PLAYER_ONE, 270)),

            Cell(CellCoordinates(0, 1), Piece(PieceType.TRIANGULAR_MIRROR, Player.PLAYER_ONE, 270)),
            Cell(CellCoordinates(1, 1), Piece(PieceType.BLOCK, Player.PLAYER_ONE)),
            Cell(CellCoordinates(2, 1), Piece(PieceType.BLOCK, Player.PLAYER_ONE)),
            Cell(CellCoordinates(3, 1), Piece(PieceType.MIRROR, Player.PLAYER_ONE)),
            Cell(CellCoordinates(4, 1), Piece(PieceType.MIRROR, Player.PLAYER_ONE, 90)),
            Cell(CellCoordinates(5, 1), Piece(PieceType.BEAM_SPLITTER, Player.PLAYER_ONE)),
            Cell(CellCoordinates(6, 1), Piece(PieceType.BLOCK, Player.PLAYER_ONE)),
            Cell(CellCoordinates(7, 1), Piece(PieceType.BLOCK, Player.PLAYER_ONE)),
            Cell(CellCoordinates(8, 1), Piece(PieceType.TRIANGULAR_MIRROR, Player.PLAYER_ONE)),

            Cell(CellCoordinates(4, 4), Piece(PieceType.HYPER_SQUARE, Player.NONE)),

            Cell(CellCoordinates(0, 7), Piece(PieceType.TRIANGULAR_MIRROR, Player.PLAYER_TWO, 180)),
            Cell(CellCoordinates(1, 7), Piece(PieceType.BLOCK, Player.PLAYER_TWO, 180)),
            Cell(CellCoordinates(2, 7), Piece(PieceType.BLOCK, Player.PLAYER_TWO, 180)),
            Cell(CellCoordinates(3, 7), Piece(PieceType.BEAM_SPLITTER, Player.PLAYER_TWO, 180)),
            Cell(CellCoordinates(4, 7), Piece(PieceType.MIRROR, Player.PLAYER_TWO, 90)),
            Cell(CellCoordinates(5, 7), Piece(PieceType.MIRROR, Player.PLAYER_TWO)),
            Cell(CellCoordinates(6, 7), Piece(PieceType.BLOCK, Player.PLAYER_TWO, 180)),
            Cell(CellCoordinates(7, 7), Piece(PieceType.BLOCK, Player.PLAYER_TWO, 180)),
            Cell(CellCoordinates(8, 7), Piece(PieceType.TRIANGULAR_MIRROR, Player.PLAYER_TWO, 90)),

            Cell(CellCoordinates(0, 8), Piece(PieceType.TRIANGULAR_MIRROR, Player.PLAYER_TWO, 90)),
            Cell(CellCoordinates(1, 8), Piece(PieceType.TRIANGULAR_MIRROR, Player.PLAYER_TWO, 90)),
            Cell(CellCoordinates(2, 8), Piece(PieceType.DIAGONAL_MIRROR, Player.PLAYER_TWO, 90)),
            Cell(CellCoordinates(3, 8), Piece(PieceType.LASER, Player.PLAYER_TWO)),
            Cell(CellCoordinates(4, 8), Piece(PieceType.KING, Player.PLAYER_TWO)),
            Cell(CellCoordinates(5, 8), Piece(PieceType.HYPER_CUBE, Player.PLAYER_TWO)),
            Cell(CellCoordinates(6, 8), Piece(PieceType.DIAGONAL_MIRROR, Player.PLAYER_TWO)),
            Cell(CellCoordinates(7, 8), Piece(PieceType.TRIANGULAR_MIRROR, Player.PLAYER_TWO, 180)),
            Cell(CellCoordinates(8, 8), Piece(PieceType.TRIANGULAR_MIRROR, Player.PLAYER_TWO, 180)),

        ]
    )
    is_started: bool = False
    turn_number: int = 0



from pydantic.dataclasses import dataclass
from enum import Enum, auto
from typing import Dict, List, Optional, Tuple, Union

CellCoordinates = Tuple[int, int]


def cell_coordinates_to_serializable(coordinates: CellCoordinates):
    return CellCoordinatesSerializable(coordinates[0], coordinates[1])


@dataclass
class CellCoordinatesSerializable:
    x: int
    y: int

    def __iter__(self):
        yield self.x
        yield self.y

    # def __init__(self, coordinates: CellCoordinates):
    #     self.x, self.y = coordinates


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
    coordinates: CellCoordinatesSerializable
    piece: Optional[Piece] = None


@dataclass
class BoardSerializable:
    cells: List[Cell]

    def to_normal(self) -> "Board":
        cells_transformed = {tuple(cell.coordinates): cell.piece for
                             cell in
                             self.cells}
        return Board(cells_transformed)


@dataclass
class Board:
    cells: Dict[CellCoordinates, Optional[Piece]]

    def to_serializable(self) -> BoardSerializable:
        cells_transformed = [Cell(cell_coordinates_to_serializable(coordinates), piece) for
                             coordinates, piece in
                             self.cells.items()]
        return BoardSerializable(cells_transformed)


@dataclass
class LaserShotEvent:
    laser_path: List[Tuple[int, CellCoordinates]]

    def to_serializable(self):
        return LaserShotEventSerializable(
            list(map(lambda x: (x[0], cell_coordinates_to_serializable(x[1])), self.laser_path)))


@dataclass
class PieceMovedEvent:
    moved_from: CellCoordinates
    moved_to: CellCoordinates

    def to_serializable(self):
        return PieceMovedEventSerializable(cell_coordinates_to_serializable(self.moved_from), cell_coordinates_to_serializable(self.moved_to))


@dataclass
class PieceRotatedEvent:
    rotated_piece_at: CellCoordinates
    rotation: int

    def to_serializable(self):
        return PieceRotatedEventSerializable(cell_coordinates_to_serializable(self.rotated_piece_at), self.rotation)


@dataclass
class TeleportEvent:
    teleported_from: CellCoordinates
    teleported_to: CellCoordinates

    def to_serializable(self):
        return TeleportEventSerializable(str(self.teleported_from), str(self.teleported_to))


@dataclass
class PieceMovedEventSerializable:
    moved_from: CellCoordinatesSerializable
    moved_to: CellCoordinatesSerializable

    def to_normal(self) -> PieceMovedEvent:
        return PieceMovedEvent(tuple(self.moved_from), tuple(self.moved_to))


@dataclass
class PieceRotatedEventSerializable:
    rotated_piece_at: CellCoordinatesSerializable
    rotation: int

    def to_normal(self) -> PieceRotatedEvent:
        return PieceRotatedEvent(tuple(self.rotated_piece_at), self.rotation)


@dataclass
class TeleportEventSerializable:
    teleported_from: CellCoordinatesSerializable
    teleported_to: CellCoordinatesSerializable


@dataclass
class LaserShotEventSerializableEntity:
    time: int
    coordinates: CellCoordinatesSerializable


@dataclass
class LaserShotEventSerializable:
    laser_path: List[LaserShotEventSerializableEntity]

    def to_normal(self) -> LaserShotEvent:
        return LaserShotEvent([(x.time, tuple(x.coordinates)) for x in self.laser_path])


GameEvent = Union[PieceRotatedEvent, PieceMovedEvent, TeleportEvent, LaserShotEvent]
GameEventSerializable = Union[
    PieceRotatedEventSerializable, PieceMovedEventSerializable, TeleportEventSerializable, LaserShotEventSerializable]


@dataclass
class GameStateSerializable:
    player_one_id: str
    player_two_id: str
    board: BoardSerializable
    is_started: bool
    turn_number: int
    game_events: List[GameEventSerializable]

    def to_normal(self) -> "GameState":
        return GameState(
            player_one_id=self.player_one_id,
            player_two_id=self.player_two_id,
            board=self.board.to_normal(),
            is_started=self.is_started,
            turn_number=self.turn_number,
            game_events=list(map(lambda x: x.to_normal(), self.game_events)),
        )


@dataclass
class GameState:
    player_one_id: str
    player_two_id: str
    board: Board
    is_started: bool
    turn_number: int
    game_events: List[GameEvent]

    def to_serializable(self) -> GameStateSerializable:
        return GameStateSerializable(
            player_one_id=self.player_one_id,
            player_two_id=self.player_two_id,
            board=self.board.to_serializable(),
            is_started=self.is_started,
            turn_number=self.turn_number,
            game_events=list(map(lambda x: x.to_serializable(), self.game_events)),
            # game_events=self.game_events,
        )


# def game_state_to_normal(gs: GameStateSerializable) -> GameState:
#     return GameState(
#         player_one_id=gs.player_one_id,
#         player_two_id=gs.player_two_id,
#         board=gs.board.to_normal(),
#         is_started=gs.is_started,
#         turn_number=gs.turn_number,
#         game_events=list(map(lambda x: x.to_normal(), gs.game_events)),
#     )


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

    return GameState(player_one_id, player_two_id, board, is_started, turn_number, [])
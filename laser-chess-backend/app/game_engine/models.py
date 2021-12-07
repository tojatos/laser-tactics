from enum import auto, Enum
from typing import Dict, List, Optional, Tuple, Union

from pydantic.dataclasses import dataclass

CellCoordinates = Tuple[int, int]


class AutoNameEnum(Enum):
    def _generate_next_value_(self, start, count, last_values):
        return self


def cell_coordinates_to_serializable(coordinates: CellCoordinates):
    return CellCoordinatesSerializable(coordinates[0], coordinates[1])


@dataclass
class CellCoordinatesSerializable:
    x: int
    y: int

    def __iter__(self):
        yield self.x
        yield self.y


class GamePhase(str, AutoNameEnum):
    NOT_STARTED = auto()
    STARTED = auto()
    PLAYER_ONE_VICTORY = auto()
    PLAYER_TWO_VICTORY = auto()
    DRAW = auto()


class PieceType(str, AutoNameEnum):
    BEAM_SPLITTER = auto()
    BLOCK = auto()
    DIAGONAL_MIRROR = auto()
    HYPER_CUBE = auto()
    HYPER_SQUARE = auto()
    KING = auto()
    LASER = auto()
    MIRROR = auto()
    TRIANGULAR_MIRROR = auto()


class Player(str, AutoNameEnum):
    PLAYER_ONE = auto()
    PLAYER_TWO = auto()
    NONE = auto()


class EventType(str, AutoNameEnum):
    PIECE_ROTATED_EVENT = auto()
    PIECE_MOVED_EVENT = auto()
    TELEPORT_EVENT = auto()
    LASER_SHOT_EVENT = auto()
    PIECE_TAKEN_EVENT = auto()
    PIECE_DESTROYED_EVENT = auto()
    SHOOT_LASER_EVENT = auto()
    GIVE_UP_EVENT = auto()
    OFFER_DRAW_EVENT = auto()


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
class GiveUpEvent:
    player: Player
    event_type: str = EventType.GIVE_UP_EVENT

    def to_serializable(self):
        return self

    def to_normal(self):
        return self


@dataclass
class OfferDrawEvent:
    player: Player
    turn_number: int
    event_type: str = EventType.OFFER_DRAW_EVENT

    def to_serializable(self):
        return self

    def to_normal(self):
        return self


@dataclass
class ShootLaserEvent:
    laser_shot: bool = True  # TODO: remove, not needed
    event_type: str = EventType.SHOOT_LASER_EVENT

    def to_serializable(self):
        return self

    def to_normal(self):
        return self


@dataclass
class LaserShotEvent:
    laser_path: List[Tuple[int, CellCoordinates]]
    event_type: str = EventType.LASER_SHOT_EVENT

    def to_serializable(self):
        return LaserShotEventSerializable(
            list(
                map(
                    lambda x: LaserShotEventSerializableEntity(x[0], cell_coordinates_to_serializable(x[1])),
                    self.laser_path,
                )
            )
        )


@dataclass
class PieceMovedEvent:
    moved_from: CellCoordinates
    moved_to: CellCoordinates
    event_type: str = EventType.PIECE_MOVED_EVENT

    def to_serializable(self):
        return PieceMovedEventSerializable(
            cell_coordinates_to_serializable(self.moved_from),
            cell_coordinates_to_serializable(self.moved_to)
        )


@dataclass
class PieceTakenEvent:
    taken_on: CellCoordinates
    piece_that_took_type: PieceType
    piece_taken_type: PieceType
    event_type: str = EventType.PIECE_DESTROYED_EVENT

    def to_serializable(self):
        return PieceTakenEventSerializable(
            cell_coordinates_to_serializable(self.taken_on),
            self.piece_that_took_type,
            self.piece_taken_type,
        )


@dataclass
class PieceDestroyedEvent:
    destroyed_on: CellCoordinates
    piece_destroyed: Piece
    laser_destroy_time: int
    event_type: str = EventType.PIECE_DESTROYED_EVENT

    def to_serializable(self):
        return PieceDestroyedEventSerializable(
            cell_coordinates_to_serializable(self.destroyed_on),
            self.piece_destroyed,
            self.laser_destroy_time,
        )


@dataclass
class PieceRotatedEvent:
    rotated_piece_at: CellCoordinates
    rotation: int
    event_type: str = EventType.PIECE_ROTATED_EVENT

    def to_serializable(self):
        return PieceRotatedEventSerializable(
            cell_coordinates_to_serializable(self.rotated_piece_at),
            self.rotation
        )


@dataclass
class TeleportEvent:
    teleported_from: CellCoordinates
    teleported_to: CellCoordinates
    teleported_by: Piece
    event_type: str = EventType.TELEPORT_EVENT

    def to_serializable(self):
        return TeleportEventSerializable(
            cell_coordinates_to_serializable(self.teleported_from),
            cell_coordinates_to_serializable(self.teleported_to),
            self.teleported_by,
        )


@dataclass
class PieceMovedEventSerializable:
    moved_from: CellCoordinatesSerializable
    moved_to: CellCoordinatesSerializable
    event_type: str = EventType.PIECE_MOVED_EVENT

    def to_normal(self) -> PieceMovedEvent:
        return PieceMovedEvent(tuple(self.moved_from), tuple(self.moved_to))


@dataclass
class PieceTakenEventSerializable:
    taken_on: CellCoordinatesSerializable
    piece_that_took_type: PieceType
    piece_taken_type: PieceType
    event_type: str = EventType.PIECE_TAKEN_EVENT

    def to_normal(self) -> PieceTakenEvent:
        return PieceTakenEvent(tuple(self.taken_on), self.piece_that_took_type, self.piece_taken_type)


@dataclass
class PieceDestroyedEventSerializable:
    destroyed_on: CellCoordinatesSerializable
    piece_destroyed: Piece
    laser_destroy_time: int
    event_type: str = EventType.PIECE_DESTROYED_EVENT

    def to_normal(self) -> PieceDestroyedEvent:
        return PieceDestroyedEvent(tuple(self.destroyed_on), self.piece_destroyed, self.laser_destroy_time)


@dataclass
class PieceRotatedEventSerializable:
    rotated_piece_at: CellCoordinatesSerializable
    rotation: int
    event_type: str = EventType.PIECE_ROTATED_EVENT

    def to_normal(self) -> PieceRotatedEvent:
        return PieceRotatedEvent(tuple(self.rotated_piece_at), self.rotation)


@dataclass
class TeleportEventSerializable:
    teleported_from: CellCoordinatesSerializable
    teleported_to: CellCoordinatesSerializable
    teleported_by: Piece
    event_type: str = EventType.TELEPORT_EVENT

    def to_normal(self) -> TeleportEvent:
        return TeleportEvent(tuple(self.teleported_from), tuple(self.teleported_to), self.teleported_by)


@dataclass
class LaserShotEventSerializableEntity:
    time: int
    coordinates: CellCoordinatesSerializable
    event_type: str = EventType.LASER_SHOT_EVENT


@dataclass
class LaserShotEventSerializable:
    laser_path: List[LaserShotEventSerializableEntity]
    event_type: str = EventType.LASER_SHOT_EVENT

    def to_normal(self) -> LaserShotEvent:
        return LaserShotEvent([(x.time, tuple(x.coordinates)) for x in self.laser_path])


GameEvent = Union[PieceRotatedEvent, PieceMovedEvent, TeleportEvent, LaserShotEvent, PieceTakenEvent,
                  PieceDestroyedEvent, GiveUpEvent, OfferDrawEvent]
UserEvent = Union[PieceRotatedEvent, PieceMovedEvent, ShootLaserEvent, GiveUpEvent, OfferDrawEvent]

GameEventSerializable = Union[PieceRotatedEventSerializable, PieceMovedEventSerializable, TeleportEventSerializable,
                              LaserShotEventSerializable, PieceTakenEventSerializable, PieceDestroyedEventSerializable,
                              GiveUpEvent, OfferDrawEvent]
UserEventSerializable = Union[PieceRotatedEventSerializable, PieceMovedEventSerializable, ShootLaserEvent, GiveUpEvent,
                              OfferDrawEvent]


@dataclass
class GameStateSerializable:
    player_one_id: str
    player_two_id: str
    board: BoardSerializable
    game_phase: GamePhase
    turn_number: int
    game_events: List[GameEventSerializable]
    user_events: List[UserEventSerializable]
    is_rated: bool

    def to_normal(self) -> "GameState":
        return GameState(
            player_one_id=self.player_one_id,
            player_two_id=self.player_two_id,
            board=self.board.to_normal(),
            game_phase=self.game_phase,
            turn_number=self.turn_number,
            game_events=list(map(lambda x: x.to_normal(), self.game_events)),
            user_events=list(map(lambda x: x.to_normal(), self.user_events)),
            is_rated=self.is_rated
        )


@dataclass
class GameState:
    player_one_id: str
    player_two_id: str
    board: Board
    game_phase: GamePhase
    turn_number: int
    game_events: List[GameEvent]
    user_events: List[UserEvent]
    is_rated: bool

    def to_serializable(self) -> GameStateSerializable:
        return GameStateSerializable(
            player_one_id=self.player_one_id,
            player_two_id=self.player_two_id,
            board=self.board.to_serializable(),
            game_phase=self.game_phase,
            turn_number=self.turn_number,
            game_events=list(map(lambda x: x.to_serializable(), self.game_events)),
            user_events=list(map(lambda x: x.to_serializable(), self.user_events)),
            is_rated=self.is_rated,
        )


def empty_game_state(player_one_id, player_two_id, is_rated=False) -> GameState:
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
        (3, 1): Piece(PieceType.MIRROR, Player.PLAYER_ONE, 90),
        (4, 1): Piece(PieceType.MIRROR, Player.PLAYER_ONE),
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
        (4, 7): Piece(PieceType.MIRROR, Player.PLAYER_TWO),
        (5, 7): Piece(PieceType.MIRROR, Player.PLAYER_TWO, 90),
        (6, 7): Piece(PieceType.BLOCK, Player.PLAYER_TWO, 180),
        (7, 7): Piece(PieceType.BLOCK, Player.PLAYER_TWO, 180),
        (8, 7): Piece(PieceType.TRIANGULAR_MIRROR, Player.PLAYER_TWO, 90),

        (0, 8): Piece(PieceType.TRIANGULAR_MIRROR, Player.PLAYER_TWO, 90),
        (1, 8): Piece(PieceType.TRIANGULAR_MIRROR, Player.PLAYER_TWO, 90),
        (2, 8): Piece(PieceType.DIAGONAL_MIRROR, Player.PLAYER_TWO, 90),
        (3, 8): Piece(PieceType.LASER, Player.PLAYER_TWO, 180),
        (4, 8): Piece(PieceType.KING, Player.PLAYER_TWO),
        (5, 8): Piece(PieceType.HYPER_CUBE, Player.PLAYER_TWO),
        (6, 8): Piece(PieceType.DIAGONAL_MIRROR, Player.PLAYER_TWO),
        (7, 8): Piece(PieceType.TRIANGULAR_MIRROR, Player.PLAYER_TWO, 180),
        (8, 8): Piece(PieceType.TRIANGULAR_MIRROR, Player.PLAYER_TWO, 180),
    })
    game_phase: GamePhase = GamePhase.NOT_STARTED
    turn_number: int = 0

    return GameState(player_one_id, player_two_id, board, game_phase, turn_number, [], [], is_rated)

from dataclasses import dataclass

from app.game_engine.models import CellCoordinatesSerializable


@dataclass
class GetGameStateRequest:
    game_id: str


@dataclass
class StartGameRequest:
    game_id: str
    player_one_id: str
    player_two_id: str


@dataclass
class ShootLaserRequest:
    game_id: str


@dataclass
class MovePieceRequest:
    game_id: str
    move_from: CellCoordinatesSerializable
    move_to: CellCoordinatesSerializable


@dataclass
class RotatePieceRequest:
    game_id: str
    rotate_at: CellCoordinatesSerializable
    angle: int

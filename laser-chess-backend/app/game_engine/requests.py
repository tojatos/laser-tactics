from dataclasses import dataclass

from .models import CellCoordinates


@dataclass(frozen=True)
class GetGameStateRequest:
    game_id: str


@dataclass(frozen=True)
class StartGameRequest:
    game_id: str


@dataclass(frozen=True)
class ShootLaserRequest:
    game_id: str


@dataclass(frozen=True)
class MovePieceRequest:
    game_id: str
    move_from: CellCoordinates
    move_to: CellCoordinates

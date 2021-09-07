import string
from dataclasses import dataclass

from game_engine.models import CellCoordinates


@dataclass(frozen=True)
class GetGameStateRequest:
    game_id: string


@dataclass(frozen=True)
class StartGameRequest:
    game_id: string


@dataclass(frozen=True)
class ShootLaserRequest:
    game_id: string


@dataclass(frozen=True)
class MovePieceRequest:
    game_id: string
    move_from: CellCoordinates
    move_to: CellCoordinates

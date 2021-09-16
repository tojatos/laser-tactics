from dataclasses import dataclass

from .models import CellCoordinates


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
    move_from: CellCoordinates
    move_to: CellCoordinates

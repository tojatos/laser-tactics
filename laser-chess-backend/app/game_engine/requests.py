from enum import Enum, auto
from typing import Union

from pydantic.dataclasses import dataclass

from app.game_engine.models import CellCoordinatesSerializable


class GameApiRequestPath(str, Enum):
    GetGameState = "/get_game_state"
    StartGame = "/start_game"
    ShootLaser = "/shoot_laser"
    MovePiece = "/move_piece"
    RotatePiece = "/rotate_piece"
    WebsocketAuth = "/ws_auth"


@dataclass
class WebsocketAuthRequest:
    token: str


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


GameApiRequest = Union[GetGameStateRequest, StartGameRequest, ShootLaserRequest, MovePieceRequest, RotatePieceRequest, WebsocketAuthRequest]


@dataclass
class WebsocketRequest:
    request_path: GameApiRequestPath
    request: GameApiRequest


@dataclass
class WebsocketResponse:
    status_code: int

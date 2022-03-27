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
    GiveUp = "/give_up"
    OfferDraw = "/offer_draw"
    WebsocketAuth = "/ws_auth"
    WebsocketObserve = "/ws_observe"


@dataclass
class WebsocketAuthRequest:
    token: str


@dataclass
class WebsocketObserveRequest:
    game_id: str


@dataclass
class GetGameStateRequest:
    game_id: str


@dataclass
class StartGameRequest:
    game_id: str
    player_one_id: str
    player_two_id: str
    is_rated: bool


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


@dataclass
class GiveUpRequest:
    game_id: str


@dataclass
class TimeoutRequest:
    game_id: str
    player_nr: int


@dataclass
class OfferDrawRequest:
    game_id: str


AuthenticatedGameApiRequestPaths = {
    GameApiRequestPath.StartGame,
    GameApiRequestPath.ShootLaser,
    GameApiRequestPath.MovePiece,
    GameApiRequestPath.RotatePiece,
    GameApiRequestPath.GiveUp,
    GameApiRequestPath.OfferDraw,
    GameApiRequestPath.Timeout,
}

GameApiRequest = Union[GetGameStateRequest, StartGameRequest, ShootLaserRequest, MovePieceRequest, RotatePieceRequest,
                       GiveUpRequest, OfferDrawRequest, TimeoutRequest, WebsocketAuthRequest, WebsocketObserveRequest]


@dataclass
class WebsocketRequest:
    request_path: GameApiRequestPath
    request: GameApiRequest


@dataclass
class WebsocketResponse:
    status_code: int
    body: str = ""

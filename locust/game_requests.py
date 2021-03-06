from dataclasses import dataclass
from enum import Enum
from typing import Union


@dataclass
class CellCoordinatesSerializable:
    x: int
    y: int

    def __iter__(self):
        yield self.x
        yield self.y


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
class OfferDrawRequest:
    game_id: str


AuthenticatedGameApiRequestPaths = {
    GameApiRequestPath.StartGame,
    GameApiRequestPath.ShootLaser,
    GameApiRequestPath.MovePiece,
    GameApiRequestPath.RotatePiece,
    GameApiRequestPath.GiveUp,
    GameApiRequestPath.OfferDraw,
}

GameApiRequest = Union[GetGameStateRequest, StartGameRequest, ShootLaserRequest, MovePieceRequest, RotatePieceRequest,
                       GiveUpRequest, OfferDrawRequest, WebsocketAuthRequest, WebsocketObserveRequest]


@dataclass
class WebsocketRequest:
    request_path: GameApiRequestPath
    request: GameApiRequest


@dataclass
class WebsocketResponse:
    status_code: int
    body: str = ""

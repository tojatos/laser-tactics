from enum import Enum, auto
from typing import Union, Optional
from pydantic.dataclasses import dataclass


class ChatApiRequestPath(str, Enum):
    WebsocketAuth = "/chat_ws_auth"
    WebsocketObserve = "/chat_ws_observe"
    GetGameChatRequest = "/get_chat"
    SendMessageRequest = "/send_message"


@dataclass
class WebsocketAuthRequest:
    token: str


@dataclass
class WebsocketObserveRequest:
    game_id: str


@dataclass
class GetGameChatRequest:
    game_id: str


@dataclass
class SendMessageRequest:
    game_id: str
    payload: str


AuthenticatedChatApiRequestPaths = {
    ChatApiRequestPath.SendMessageRequest
}

ChatApiRequest = Union[GetGameChatRequest, SendMessageRequest, WebsocketAuthRequest, WebsocketObserveRequest]


@dataclass
class WebsocketRequest:
    request_path: ChatApiRequestPath
    request: ChatApiRequest


@dataclass
class WebsocketResponse:
    status_code: int
    body: str = ""

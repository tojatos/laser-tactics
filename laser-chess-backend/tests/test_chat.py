import pytest
from starlette.websockets import WebSocket

from app.game_engine.requests import StartGameRequest
from app.chat.models import *
from app.chat.requests import *
from app.main import app, get_db, API_PREFIX
from tests.conftest import engine, TestingSessionLocal
from tests.utils import *

tokens = []
game_id = "some_id"


@pytest.fixture(autouse=True)
def ws(client):
    with client.websocket_connect("/chat") as ws:
        ws: WebSocket
        yield ws


@pytest.fixture(scope="session", autouse=True)
def before_all():
    global tokens

    connection = engine.connect()
    session = TestingSessionLocal(bind=connection)

    def override_get_db():
        yield session

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    tu = TUtils(client, API_PREFIX)

    create_user_datas = list(
        map(lambda x: dict(username=f"test{x}", email=f"test{x}@example.com", password=f"test{x}"), range(0, 3)))
    tokens = list(map(lambda create_user_data: tu.post_create_user(create_user_data), create_user_datas))
    for user in create_user_datas:
        verify_user(session, user["username"])
    start_game_request = StartGameRequest(game_id, create_user_datas[0]['username'], create_user_datas[1]['username'],
                                          True, True, 200, 200)

    start_game_response = tu.post_data(
        "/lobby/start_game",
        tokens[0],
        json=dataclasses.asdict(start_game_request),
    )
    assert start_game_response.status_code == 200

    session.commit()


def send_dataclass(ws: WebSocket, d: any):
    ws.send_json(dataclasses.asdict(d))


def receive_ws_response(ws: WebSocket):
    response_json = ws.receive_json()
    return WebsocketResponse(**response_json)


def auth(ws: WebSocket, token_num: int):
    request = WebsocketRequest(ChatApiRequestPath.WebsocketAuth, WebsocketAuthRequest(tokens[token_num]))
    send_dataclass(ws, request)
    return receive_ws_response(ws)


def observe(ws: WebSocket, game_id: str):
    request = WebsocketRequest(ChatApiRequestPath.WebsocketObserve, WebsocketObserveRequest(game_id))
    send_dataclass(ws, request)
    return receive_ws_response(ws)


def send_message(ws: WebSocket, message: str):
    request = WebsocketRequest(ChatApiRequestPath.SendMessageRequest, SendMessageRequest(game_id, message))
    send_dataclass(ws, request)
    return receive_ws_response(ws)


def get_chat(ws: WebSocket):
    request = WebsocketRequest(ChatApiRequestPath.GetGameChatRequest, GetGameChatRequest(game_id))
    send_dataclass(ws, request)
    response = ws.receive_json()
    return GameChat(**response)


def test_get_empty_chat(ws):
    chat = get_chat(ws)
    assert chat.game_id == "some_id"
    assert chat.messages == []


def test_send_message(ws):
    auth(ws, 0)
    response = send_message(ws,  "test")
    assert response.status_code == 200
    chat = get_chat(ws)
    assert chat.messages == [Message("test", "test0")]

    auth(ws, 1)
    response = send_message(ws, "yo")
    assert response.status_code == 200
    chat = get_chat(ws)
    assert chat.messages == [Message("test", "test0"), Message("yo", "test1")]

    auth(ws, 0)
    response = send_message(ws, "test")
    assert response.status_code == 200
    chat = get_chat(ws)
    assert chat.messages == [Message("test", "test0"), Message("yo", "test1"), Message("test", "test0")]


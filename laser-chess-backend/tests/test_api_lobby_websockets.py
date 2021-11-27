import pytest

from app.core.dependecies import manager
from app.core.routers.lobby import *
from app.main import app, get_db, API_PREFIX
from tests.conftest import engine, TestingSessionLocal
from tests.utils import *

tokens = []
game_id = "some_id"


@pytest.fixture(autouse=True)
def ws(client):
    with client.websocket_connect("/ws") as ws:
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
        map(lambda x: dict(username=f"test{x}", email=f"test{x}@example.com", password=f"test{x}"), range(0, 10)))
    tokens = list(map(lambda create_user_data: tu.post_create_user(create_user_data), create_user_datas))
    for user in create_user_datas:
        verify_user(session, user["username"])
    response = tu.post_data("/lobby/create", tokens[9])
    assert response.status_code == 201
    global game_id
    game_id = response.json()['game_id']

    session.commit()


def send_dataclass(ws: WebSocket, d: any):
    ws.send_json(dataclasses.asdict(d))


def receive_ws_response(ws: WebSocket):
    response_json = ws.receive_json()
    return WebsocketResponse(**response_json)


def observe(ws: WebSocket, game_id: str):
    request = WebsocketRequest(WebsocketObserveRequest(game_id))
    send_dataclass(ws, request)
    return receive_ws_response(ws)


def test_websocket_notify(client):
    tu = TUtils(client, API_PREFIX)

    with client.websocket_connect("/lobby_ws") as ws0, \
            client.websocket_connect("/lobby_ws") as ws1:
        ws0: WebSocket
        ws1: WebSocket

        assert observe(ws0, game_id).status_code == 200
        assert observe(ws1, game_id).status_code == 200

        response = tu.patch_data(f"/lobby/join", tokens[1], json={"game_id": game_id})
        assert response.status_code == 200

        lobby_dict = ws0.receive_json()
        assert lobby_dict["player_one_username"] is not None
        assert lobby_dict["player_two_username"] is not None

        response = tu.patch_data(f"/lobby/leave", tokens[1], json={"game_id": game_id})
        assert response.status_code == 200

        lobby_dict = ws0.receive_json()
        assert lobby_dict["player_one_username"] is not None
        assert lobby_dict["player_two_username"] is None

        ws0.close()

def test_websocket_notify_game_start(client):
    tu = TUtils(client, API_PREFIX)

    with client.websocket_connect("/lobby_ws") as ws0, \
            client.websocket_connect("/lobby_ws") as ws1:
        ws0: WebSocket
        ws1: WebSocket

        assert observe(ws0, game_id).status_code == 200
        assert observe(ws1, game_id).status_code == 200

        response = tu.patch_data(f"/lobby/join", tokens[1], json={"game_id": game_id})
        assert response.status_code == 200

        lobby_dict = ws0.receive_json()
        assert lobby_dict["player_one_username"] is not None
        assert lobby_dict["player_two_username"] is not None

        start_game_request = StartGameRequest(game_id, "test0", "test1", False)
        start_game_response = tu.post_data(
            "/lobby/start_game",
            tokens[0],
            json=dataclasses.asdict(start_game_request),
        )
        assert start_game_response.status_code == 200

        lobby_dict = ws0.receive_json()
        assert lobby_dict["lobby_status"] == "GAME_STARTED"

        ws0.close()
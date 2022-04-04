import pytest
from starlette.websockets import WebSocket

from app.game_engine.models import *
from app.game_engine.requests import *
from app.main import app, get_db, API_PREFIX
from tests.conftest import engine, TestingSessionLocal
from tests.utils import *

tokens = []
game_id = "some_id"
game_id_2 = "some_other_id"


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
        map(lambda x: dict(username=f"test{x}", email=f"test{x}@example.com", password=f"test{x}"), range(0, 3)))
    tokens = list(map(lambda create_user_data: tu.post_create_user(create_user_data), create_user_datas))
    for user in create_user_datas:
        verify_user(session, user["username"])
    start_game_request = StartGameRequest(game_id, create_user_datas[0]['username'], create_user_datas[1]['username'],
                                          True, False)
    start_game_response = tu.post_data(
        "/lobby/start_game",
        tokens[0],
        json=dataclasses.asdict(start_game_request),
    )
    assert start_game_response.status_code == 200

    start_game_unrated_request = StartGameRequest(game_id_2, create_user_datas[0]['username'],
                                                  create_user_datas[1]['username'],
                                                  False, False)

    start_game_unrated_response = tu.post_data(
        "/lobby/start_game",
        tokens[0],
        json=dataclasses.asdict(start_game_unrated_request),
    )
    assert start_game_unrated_response.status_code == 200

    session.commit()


get_game_state_request = GetGameStateRequest(game_id)
get_game_state_unrated_request = GetGameStateRequest(game_id_2)
shoot_laser_request = ShootLaserRequest(game_id)
p1_laser_coordinates = (5, 0)
p2_laser_coordinates = (3, 8)
p1_king_coordinates = (4, 0)
p2_king_coordinates = (4, 8)


def get_game_state(ws: WebSocket):
    request = WebsocketRequest(GameApiRequestPath.GetGameState, get_game_state_request)
    ws.send_json(dataclasses.asdict(request))
    game_state_dict = ws.receive_json()
    game_state_serializable: GameStateSerializable = GameStateSerializable(**game_state_dict)
    game_state = game_state_serializable.to_normal()
    return game_state


def get_game_state_unrated(ws: WebSocket):
    request = WebsocketRequest(GameApiRequestPath.GetGameState, get_game_state_unrated_request)
    ws.send_json(dataclasses.asdict(request))
    game_state_dict = ws.receive_json()
    game_state_serializable: GameStateSerializable = GameStateSerializable(**game_state_dict)
    game_state = game_state_serializable.to_normal()
    return game_state


def send_dataclass(ws: WebSocket, d: any):
    ws.send_json(dataclasses.asdict(d))


def receive_ws_response(ws: WebSocket):
    response_json = ws.receive_json()
    return WebsocketResponse(**response_json)


def auth(ws: WebSocket, token_num: int):
    request = WebsocketRequest(GameApiRequestPath.WebsocketAuth, WebsocketAuthRequest(tokens[token_num]))
    send_dataclass(ws, request)
    return receive_ws_response(ws)


def observe(ws: WebSocket, game_id: str):
    request = WebsocketRequest(GameApiRequestPath.WebsocketObserve, WebsocketObserveRequest(game_id))
    send_dataclass(ws, request)
    return receive_ws_response(ws)


def give_up(ws: WebSocket, token_num: int):
    auth(ws, token_num)
    request = WebsocketRequest(GameApiRequestPath.GiveUp, GiveUpRequest(game_id))
    send_dataclass(ws, request)
    return receive_ws_response(ws)


def give_up_unrated(ws: WebSocket, token_num: int):
    auth(ws, token_num)
    request = WebsocketRequest(GameApiRequestPath.GiveUp, GiveUpRequest(game_id_2))
    send_dataclass(ws, request)
    return receive_ws_response(ws)


def offer_draw(ws: WebSocket, token_num: int):
    auth(ws, token_num)
    request = WebsocketRequest(GameApiRequestPath.OfferDraw, OfferDrawRequest(game_id))
    send_dataclass(ws, request)
    return receive_ws_response(ws)


def shoot_laser(ws: WebSocket, token_num: int):
    auth(ws, token_num)
    request = WebsocketRequest(GameApiRequestPath.ShootLaser, shoot_laser_request)
    send_dataclass(ws, request)
    return receive_ws_response(ws)


def move_piece(ws: WebSocket, token_num: int, coordinates_from: CellCoordinates, coordinates_to: CellCoordinates):
    auth(ws, token_num)
    move_piece_request = MovePieceRequest(game_id,
                                          cell_coordinates_to_serializable(coordinates_from),
                                          cell_coordinates_to_serializable(coordinates_to))
    request = WebsocketRequest(GameApiRequestPath.MovePiece, move_piece_request)
    send_dataclass(ws, request)
    return receive_ws_response(ws)


def rotate_piece(ws: WebSocket, token_num: int, coordinates: CellCoordinates, degrees: int):
    auth(ws, token_num)
    rotate_piece_request = RotatePieceRequest(game_id, cell_coordinates_to_serializable(coordinates), degrees)
    request = WebsocketRequest(GameApiRequestPath.RotatePiece, rotate_piece_request)
    send_dataclass(ws, request)
    return receive_ws_response(ws)


def test_p2_victory(ws, tu):
    rotate_piece(ws, 0, p1_laser_coordinates, 270)
    shoot_laser(ws, 0)

    game_state = get_game_state(ws)
    assert game_state.board.cells[p1_king_coordinates] is None
    assert game_state.game_phase is GamePhase.PLAYER_TWO_VICTORY

    response = rotate_piece(ws, 1, p2_laser_coordinates, 270)
    assert response.status_code == 403

    response = tu.get_data("/users/test0/history")
    record = response.json()[0]
    assert record["player_one_username"] == "test0"
    assert record["player_one_rating"] == 1500
    assert record["player_one_deviation"] == 200
    assert record["player_one_volatility"] == 0.06
    assert record["player_two_username"] == "test1"
    assert record["player_two_rating"] == 1500
    assert record["player_two_deviation"] == 200
    assert record["player_two_volatility"] == 0.06
    assert record["result"] == "PLAYER_TWO_WIN"
    assert record["game_id"] == game_id
    assert record["player_one_new_rating"] == 1421
    assert record["player_two_new_rating"] == 1578


def test_p1_victory(ws, tu):
    rotate_piece(ws, 0, p1_laser_coordinates, 270)
    rotate_piece(ws, 0, p1_laser_coordinates, 270)
    rotate_piece(ws, 1, p2_laser_coordinates, 270)
    shoot_laser(ws, 1)

    game_state = get_game_state(ws)
    assert game_state.board.cells[p2_king_coordinates] is None
    assert game_state.game_phase is GamePhase.PLAYER_ONE_VICTORY

    response = rotate_piece(ws, 0, p1_laser_coordinates, 270)
    assert response.status_code == 403

    response = tu.get_data("/users/test0/history")
    record = response.json()[0]
    assert record["player_one_username"] == "test0"
    assert record["player_one_rating"] == 1500
    assert record["player_one_deviation"] == 200
    assert record["player_one_volatility"] == 0.06
    assert record["player_two_username"] == "test1"
    assert record["player_two_rating"] == 1500
    assert record["player_two_deviation"] == 200
    assert record["player_two_volatility"] == 0.06
    assert record["result"] == "PLAYER_ONE_WIN"
    assert record["game_id"] == game_id
    assert record["player_one_new_rating"] == 1578
    assert record["player_two_new_rating"] == 1421


def test_draw(ws, tu):
    rotate_piece(ws, 0, (6, 0), 90)
    rotate_piece(ws, 0, (0, 1), 180)
    rotate_piece(ws, 1, (6, 8), 90)
    move_piece(ws, 1, (6, 7), (6, 6))
    rotate_piece(ws, 0, (4, 1), 90)
    move_piece(ws, 0, (5, 1), (5, 2))
    move_piece(ws, 1, (6, 6), (7, 6))
    rotate_piece(ws, 1, (8, 8), 90)  # fill move
    move_piece(ws, 0, (6, 1), (6, 2))
    move_piece(ws, 0, (6, 2), (7, 2))
    rotate_piece(ws, 1, (8, 8), 90)  # fill move
    rotate_piece(ws, 1, (8, 8), 90)  # fill move
    move_piece(ws, 0, (6, 0), (6, 1))
    move_piece(ws, 0, (6, 1), (6, 2))
    rotate_piece(ws, 1, (8, 8), 90)  # fill move
    rotate_piece(ws, 1, (8, 8), 90)  # fill move
    move_piece(ws, 0, (0, 1), (0, 2))
    move_piece(ws, 0, (0, 2), (1, 2))
    rotate_piece(ws, 1, (8, 8), 90)  # fill move
    rotate_piece(ws, 1, (8, 8), 90)  # fill move
    move_piece(ws, 0, (1, 2), (2, 2))
    move_piece(ws, 0, (2, 2), (3, 2))
    rotate_piece(ws, 1, (8, 8), 90)  # fill move
    rotate_piece(ws, 1, (8, 8), 90)  # fill move
    move_piece(ws, 0, (3, 2), (4, 2))
    shoot_laser(ws, 0)

    game_state = get_game_state(ws)

    assert game_state.board.cells[p1_king_coordinates] is None
    assert game_state.board.cells[p2_king_coordinates] is None
    assert game_state.game_phase is GamePhase.DRAW

    response = rotate_piece(ws, 1, p2_laser_coordinates, 270)
    assert response.status_code == 403
    assert response.body == "Unable to rotate. The game is over."

    response = tu.get_data("/users/test0/history")
    record = response.json()[0]
    assert record["player_one_username"] == "test0"
    assert record["player_one_rating"] == 1500
    assert record["player_one_deviation"] == 200
    assert record["player_one_volatility"] == 0.06
    assert record["player_two_username"] == "test1"
    assert record["player_two_rating"] == 1500
    assert record["player_two_deviation"] == 200
    assert record["player_two_volatility"] == 0.06
    assert record["result"] == "DRAW"
    assert record["game_id"] == game_id
    assert record["player_one_new_rating"] == 1500
    assert record["player_two_new_rating"] == 1500


def test_play_the_game(ws):
    game_state = get_game_state(ws)
    assert game_state.game_phase is GamePhase.STARTED
    assert game_state.turn_number is 1

    response = move_piece(ws, 0, (0, 1), (0, 2))
    assert response.status_code == 200

    response = rotate_piece(ws, 0, (0, 2), 90)
    assert response.status_code == 200

    game_state = get_game_state(ws)
    assert game_state.game_phase is GamePhase.STARTED
    assert game_state.turn_number is 3
    assert game_state.board.cells[(0, 1)] is None
    assert game_state.board.cells[(0, 2)] is not None


def test_give_up_p1(ws, tu):
    assert give_up(ws, 0).status_code == 200
    game_state = get_game_state(ws)
    assert game_state.game_phase is GamePhase.PLAYER_TWO_VICTORY

    response = tu.get_data(f"/game/history/{game_id}")
    record = response.json()
    assert record["player_one_username"] == "test0"
    assert record["player_one_rating"] == 1500
    assert record["player_one_deviation"] == 200
    assert record["player_one_volatility"] == 0.06
    assert record["player_two_username"] == "test1"
    assert record["player_two_rating"] == 1500
    assert record["player_two_deviation"] == 200
    assert record["player_two_volatility"] == 0.06
    assert record["result"] == "PLAYER_TWO_WIN"
    assert record["game_id"] == game_id
    assert record["player_one_new_rating"] == 1421
    assert record["player_two_new_rating"] == 1578


def test_give_up_p2(ws, tu):
    assert give_up(ws, 1).status_code == 200
    game_state = get_game_state(ws)
    assert game_state.game_phase is GamePhase.PLAYER_ONE_VICTORY

    response = tu.get_data(f"/game/history/{game_id}")
    record = response.json()
    assert record["player_one_username"] == "test0"
    assert record["player_one_rating"] == 1500
    assert record["player_one_deviation"] == 200
    assert record["player_one_volatility"] == 0.06
    assert record["player_two_username"] == "test1"
    assert record["player_two_rating"] == 1500
    assert record["player_two_deviation"] == 200
    assert record["player_two_volatility"] == 0.06
    assert record["result"] == "PLAYER_ONE_WIN"
    assert record["game_id"] == game_id
    assert record["player_one_new_rating"] == 1578
    assert record["player_two_new_rating"] == 1421


def test_give_up_unrated_p1(ws, tu):
    assert give_up_unrated(ws, 0).status_code == 200
    game_state = get_game_state_unrated(ws)
    assert game_state.game_phase is GamePhase.PLAYER_TWO_VICTORY

    response = tu.get_data(f"/game/history/{game_id_2}")
    record = response.json()
    assert record["player_one_username"] == "test0"
    assert record["player_one_rating"] == 1500
    assert record["player_one_deviation"] == 200
    assert record["player_one_volatility"] == 0.06
    assert record["player_two_username"] == "test1"
    assert record["player_two_rating"] == 1500
    assert record["player_two_deviation"] == 200
    assert record["player_two_volatility"] == 0.06
    assert record["result"] == "PLAYER_TWO_WIN"
    assert record["game_id"] == game_id_2
    assert record["player_one_new_rating"] is None
    assert record["player_two_new_rating"] is None


def test_give_up_unrated_p2(ws, tu):
    assert give_up_unrated(ws, 1).status_code == 200
    game_state = get_game_state_unrated(ws)
    assert game_state.game_phase is GamePhase.PLAYER_ONE_VICTORY

    response = tu.get_data(f"/game/history/{game_id_2}")
    record = response.json()
    assert record["player_one_username"] == "test0"
    assert record["player_one_rating"] == 1500
    assert record["player_one_deviation"] == 200
    assert record["player_one_volatility"] == 0.06
    assert record["player_two_username"] == "test1"
    assert record["player_two_rating"] == 1500
    assert record["player_two_deviation"] == 200
    assert record["player_two_volatility"] == 0.06
    assert record["result"] == "PLAYER_ONE_WIN"
    assert record["game_id"] == game_id_2
    assert record["player_one_new_rating"] is None
    assert record["player_two_new_rating"] is None

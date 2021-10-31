import dataclasses
from dataclasses import asdict

import pytest
from starlette.websockets import WebSocket

from app.game_engine.models import *
from app.game_engine.requests import *
from app.main import app, get_db, API_PREFIX
from tests.conftest import engine, TestingSessionLocal
from tests.utils import *

tokens = []
game_id = "some_id"


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
        map(lambda x: dict(username=f"test{x}", email=f"test{x}@example.com", password=f"test{x}"), range(0, 2)))
    tokens = list(map(lambda create_user_data: tu.post_create_user(create_user_data), create_user_datas))
    tu.post_data(
        "/start_game",
        tokens[0],
        json=dict(game_id=game_id, player_one_id=create_user_datas[0]['username'],
                  player_two_id=create_user_datas[1]['username']),
    )

    session.commit()


get_game_state_request = GetGameStateRequest(game_id)
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


def auth(ws: WebSocket, token_num: int):
    request = WebsocketRequest(GameApiRequestPath.WebsocketAuth, WebsocketAuthRequest(tokens[token_num]))
    ws.send_json(dataclasses.asdict(request))
    response_json = ws.receive_json()
    return WebsocketResponse(**response_json)


def shoot_laser(ws: WebSocket, token_num: int):
    auth(ws, token_num)
    request = WebsocketRequest(GameApiRequestPath.ShootLaser, shoot_laser_request)
    ws.send_json(dataclasses.asdict(request))
    response_json = ws.receive_json()
    return WebsocketResponse(**response_json)


def move_piece(ws: WebSocket, token_num: int, coordinates_from: CellCoordinates, coordinates_to: CellCoordinates):
    auth(ws, token_num)

    move_piece_request = MovePieceRequest(game_id,
                                          cell_coordinates_to_serializable(coordinates_from),
                                          cell_coordinates_to_serializable(coordinates_to))
    request = WebsocketRequest(GameApiRequestPath.MovePiece, move_piece_request)
    ws.send_json(dataclasses.asdict(request))
    response_json = ws.receive_json()
    return WebsocketResponse(**response_json)


# def post_rotate_piece(tu, token_num: int, coordinates: CellCoordinates, degrees: int):
#     request = RotatePieceRequest(game_id, cell_coordinates_to_serializable(coordinates), degrees)
#     return tu.post_data("/rotate_piece", tokens[token_num], json=asdict(request))
#
#
def test_start_game(client: TestClient):
    with client.websocket_connect("/ws") as ws:
        ws: WebSocket
        game_state = get_game_state(ws)
        assert game_state.game_phase is GamePhase.STARTED
        assert game_state.turn_number is 1


def test_auth(client: TestClient):
    with client.websocket_connect("/ws") as ws:
        ws: WebSocket
        response = auth(ws, 0)
        assert response.status_code == 200


def test_shoot_laser(client: TestClient):
    with client.websocket_connect("/ws") as ws:
        ws: WebSocket
        response = shoot_laser(ws, 0)
        assert response.status_code == 200

        game_state = get_game_state(ws)
        assert game_state.board.cells[(5, 0)] is None
        assert game_state.board.cells[(6, 1)] is None


def test_move_block(client):
    with client.websocket_connect("/ws") as ws:
        ws: WebSocket
        response = move_piece(ws, 0, (1, 1), (1, 2))
        assert response.status_code == 200

        game_state = get_game_state(ws)
        assert game_state.board.cells[(1, 1)] is None
        assert game_state.board.cells[(1, 2)] is not None


def test_move_block_on_own_piece(client):
    with client.websocket_connect("/ws") as ws:
        ws: WebSocket
        response = move_piece(ws, 0, (1, 1), (2, 1))
        assert response.status_code != 200

        game_state = get_game_state(ws)
        assert game_state.board.cells[(1, 1)] is not None
        assert game_state.board.cells[(2, 1)] is not None


# def test_rotate_block(tu):
#     response = post_rotate_piece(tu, 0, (1, 1), 90)
#     assert response.status_code == 200
#
#     game_state = game_state_from_response(post_get_game_state(tu))
#     assert game_state.board.cells[(1, 1)] == Piece(PieceType.BLOCK, Player.PLAYER_ONE, 90)
#
#
# def test_rotate_empty(tu):
#     response = post_rotate_piece(tu, 0, (3, 3), 90)
#     assert response.status_code != 200
#
#
# def test_rotate_as_guest(tu):
#     request = RotatePieceRequest(game_id, CellCoordinatesSerializable(1, 1), 90)
#     response = tu.post_data("/rotate_piece", json=asdict(request))
#     assert response.status_code == 401
#
#
# def test_rotate_as_other_player(tu):
#     response = post_rotate_piece(tu, 0, (1, 1), 90)
#     assert response.status_code == 200
#     response = post_rotate_piece(tu, 0, (1, 1), 90)
#     assert response.status_code == 200
#     response = post_rotate_piece(tu, 1, (1, 1), 90)
#     assert response.status_code == 403
#
#
# def test_rotate_hypercube(tu):
#     response = post_rotate_piece(tu, 0, (4, 4), 90)
#     assert response.status_code != 200
#
#
# def test_rotate_block_invalid_angle(tu):
#     invalid_angles = [89, 324, -1, 360, 34, 91, 271]
#     for angle in invalid_angles:
#         response = post_rotate_piece(tu, 0, (1, 1), angle)
#         assert response.status_code != 200
#
#
# def test_use_hyper_square(tu):
#     post_move_piece(tu, 0, (4, 1), (4, 2))
#     post_move_piece(tu, 0, (4, 2), (4, 3))
#     post_rotate_piece(tu, 1, (4, 7), 90)
#     post_rotate_piece(tu, 1, (4, 7), 90)
#     response = post_move_piece(tu, 0, (4, 3), (4, 4))
#     assert response.status_code == 200
#
#
# def test_p2_victory(tu):
#     post_rotate_piece(tu, 0, p1_laser_coordinates, 270)
#     post_shoot_laser(tu, 0)
#
#     game_state = game_state_from_response(post_get_game_state(tu))
#     assert game_state.board.cells[p1_king_coordinates] is None
#     assert game_state.game_phase is GamePhase.PLAYER_TWO_VICTORY
#
#     response = post_rotate_piece(tu, 1, p2_laser_coordinates, 270)
#     assert response.status_code == 403
#
#
# def test_p1_victory(tu):
#     post_rotate_piece(tu, 0, p1_laser_coordinates, 270)
#     post_rotate_piece(tu, 0, p1_laser_coordinates, 270)
#     post_rotate_piece(tu, 1, p2_laser_coordinates, 270)
#     post_shoot_laser(tu, 1)
#
#     game_state = game_state_from_response(post_get_game_state(tu))
#     assert game_state.board.cells[p2_king_coordinates] is None
#     assert game_state.game_phase is GamePhase.PLAYER_ONE_VICTORY
#
#     response = post_rotate_piece(tu, 0, p1_laser_coordinates, 270)
#     assert response.status_code == 403
#
#
# def test_draw(tu):
#     post_rotate_piece(tu, 0, (6, 0), 90)
#     post_rotate_piece(tu, 0, (0, 1), 180)
#     post_rotate_piece(tu, 1, (6, 8), 90)
#     post_move_piece(tu, 1, (6, 7), (6, 6))
#     post_rotate_piece(tu, 0, (4, 1), 90)
#     post_move_piece(tu, 0, (5, 1), (5, 2))
#     post_move_piece(tu, 1, (6, 6), (7, 6))
#     post_rotate_piece(tu, 1, (8, 8), 90)  # fill move
#     post_move_piece(tu, 0, (6, 1), (6, 2))
#     post_move_piece(tu, 0, (6, 2), (7, 2))
#     post_rotate_piece(tu, 1, (8, 8), 90)  # fill move
#     post_rotate_piece(tu, 1, (8, 8), 90)  # fill move
#     post_move_piece(tu, 0, (6, 0), (6, 1))
#     post_move_piece(tu, 0, (6, 1), (6, 2))
#     post_rotate_piece(tu, 1, (8, 8), 90)  # fill move
#     post_rotate_piece(tu, 1, (8, 8), 90)  # fill move
#     post_move_piece(tu, 0, (0, 1), (0, 2))
#     post_move_piece(tu, 0, (0, 2), (1, 2))
#     post_rotate_piece(tu, 1, (8, 8), 90)  # fill move
#     post_rotate_piece(tu, 1, (8, 8), 90)  # fill move
#     post_move_piece(tu, 0, (1, 2), (2, 2))
#     post_move_piece(tu, 0, (2, 2), (3, 2))
#     post_rotate_piece(tu, 1, (8, 8), 90)  # fill move
#     post_rotate_piece(tu, 1, (8, 8), 90)  # fill move
#     post_move_piece(tu, 0, (3, 2), (4, 2))
#     post_shoot_laser(tu, 0)
#
#     game_state = game_state_from_response(post_get_game_state(tu))
#
#     assert game_state.board.cells[p1_king_coordinates] is None
#     assert game_state.board.cells[p2_king_coordinates] is None
#     assert game_state.game_phase is GamePhase.DRAW
#
#     response = post_rotate_piece(tu, 1, p2_laser_coordinates, 270)
#     assert response.status_code == 403
#
#
# def test_play_the_game(tu):
#     game_state = game_state_from_response(post_get_game_state(tu))
#     assert game_state.game_phase is GamePhase.STARTED
#     assert game_state.turn_number is 1
#
#     response = post_move_piece(tu, 0, (0, 1), (0, 2))
#     assert response.status_code == 200
#
#     response = post_rotate_piece(tu, 0, (0, 2), 90)
#     assert response.status_code == 200
#
#     game_state = game_state_from_response(post_get_game_state(tu))
#     assert game_state.game_phase is GamePhase.STARTED
#     assert game_state.turn_number is 3
#     assert game_state.board.cells[(0, 1)] is None
#     assert game_state.board.cells[(0, 2)] is not None

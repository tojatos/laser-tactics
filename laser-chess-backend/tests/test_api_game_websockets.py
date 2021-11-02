import pytest
from starlette.websockets import WebSocket

from app.game_engine.models import *
from app.game_engine.requests import *
from app.main import app, get_db, API_PREFIX
from tests.conftest import engine, TestingSessionLocal
from tests.utils import *

tokens = []
game_id = "some_id"
get_game_state_request = GetGameStateRequest(game_id)
shoot_laser_request = ShootLaserRequest(game_id)

@pytest.fixture(autouse=True)
def ws(client):
    with client.websocket_connect("/ws") as ws:
        ws: WebSocket
        yield ws


@pytest.fixture(scope="session", autouse=True)
def before_all():
    global tokens
    global game_id
    global get_game_state_request, shoot_laser_request

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

    lobby_response = tu.post_data("/lobby/create",
                 tokens[0]).json()
    lobby_id = lobby_response["id"]
    response = tu.patch_data(f"/lobby/join?lobby_id={lobby_id}",
                  tokens[1]
                  )

    game_id = lobby_response["game_id"]
    get_game_state_request = GetGameStateRequest(game_id)
    shoot_laser_request = ShootLaserRequest(game_id)
    tu.post_data(
        "/start_game",
        tokens[0],
        json=dict(lobby_id=lobby_response["id"])
                  )

    session.commit()


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


def send_dataclass(ws: WebSocket, d: any):
    ws.send_json(dataclasses.asdict(d))


def receive_ws_response(ws: WebSocket):
    response_json = ws.receive_json()
    return WebsocketResponse(**response_json)


def auth(ws: WebSocket, token_num: int):
    request = WebsocketRequest(GameApiRequestPath.WebsocketAuth, WebsocketAuthRequest(tokens[token_num]))
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


def test_start_game(ws):
    game_state = get_game_state(ws)
    assert game_state.game_phase is GamePhase.STARTED
    assert game_state.turn_number is 1


def test_auth(ws):
    response = auth(ws, 0)
    assert response.status_code == 200


def test_shoot_laser(ws):
    response = shoot_laser(ws, 0)
    assert response.status_code == 200

    game_state = get_game_state(ws)
    assert game_state.board.cells[(5, 0)] is None
    assert game_state.board.cells[(6, 1)] is None


def test_move_block(ws):
    response = move_piece(ws, 0, (1, 1), (1, 2))
    assert response.status_code == 200

    game_state = get_game_state(ws)
    assert game_state.board.cells[(1, 1)] is None
    assert game_state.board.cells[(1, 2)] is not None


def test_move_block_on_own_piece(ws):
    response = move_piece(ws, 0, (1, 1), (2, 1))
    assert response.status_code != 200

    game_state = get_game_state(ws)
    assert game_state.board.cells[(1, 1)] is not None
    assert game_state.board.cells[(2, 1)] is not None


def test_rotate_block(ws):
    response = rotate_piece(ws, 0, (1, 1), 90)
    assert response.status_code == 200

    game_state = get_game_state(ws)
    assert game_state.board.cells[(1, 1)] == Piece(PieceType.BLOCK, Player.PLAYER_ONE, 90)


def test_rotate_empty(ws):
    response = rotate_piece(ws, 0, (3, 3), 90)
    assert response.status_code != 200


def test_rotate_as_guest(ws):
    rotate_piece_request = RotatePieceRequest(game_id, CellCoordinatesSerializable(1, 1), 90)
    request = WebsocketRequest(GameApiRequestPath.RotatePiece, rotate_piece_request)
    send_dataclass(ws, request)
    response = receive_ws_response(ws)
    assert response.status_code == 401


def test_rotate_as_other_player(ws):
    response = rotate_piece(ws, 0, (1, 1), 90)
    assert response.status_code == 200
    response = rotate_piece(ws, 0, (1, 1), 90)
    assert response.status_code == 200
    response = rotate_piece(ws, 1, (1, 1), 90)
    assert response.status_code == 403


def test_rotate_hypercube(ws):
    response = rotate_piece(ws, 0, (4, 4), 90)
    assert response.status_code != 200


def test_rotate_block_invalid_angle(ws):
    invalid_angles = [89, 324, -1, 360, 34, 91, 271]
    for angle in invalid_angles:
        response = rotate_piece(ws, 0, (1, 1), angle)
        assert response.status_code != 200


def test_use_hyper_square(ws):
    move_piece(ws, 0, (4, 1), (4, 2))
    move_piece(ws, 0, (4, 2), (4, 3))
    rotate_piece(ws, 1, (4, 7), 90)
    rotate_piece(ws, 1, (4, 7), 90)
    response = move_piece(ws, 0, (4, 3), (4, 4))
    assert response.status_code == 200


def test_p2_victory(ws):
    rotate_piece(ws, 0, p1_laser_coordinates, 270)
    shoot_laser(ws, 0)

    game_state = get_game_state(ws)
    assert game_state.board.cells[p1_king_coordinates] is None
    assert game_state.game_phase is GamePhase.PLAYER_TWO_VICTORY

    response = rotate_piece(ws, 1, p2_laser_coordinates, 270)
    assert response.status_code == 403


def test_p1_victory(ws):
    rotate_piece(ws, 0, p1_laser_coordinates, 270)
    rotate_piece(ws, 0, p1_laser_coordinates, 270)
    rotate_piece(ws, 1, p2_laser_coordinates, 270)
    shoot_laser(ws, 1)

    game_state = get_game_state(ws)
    assert game_state.board.cells[p2_king_coordinates] is None
    assert game_state.game_phase is GamePhase.PLAYER_ONE_VICTORY

    response = rotate_piece(ws, 0, p1_laser_coordinates, 270)
    assert response.status_code == 403


def test_draw(ws):
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

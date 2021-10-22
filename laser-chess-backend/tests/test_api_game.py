from dataclasses import asdict

import pytest

from app.game_engine.models import *
from app.game_engine.requests import *
from app.main import app, get_db, API_PREFIX
from tests.conftest import engine, TestingSessionLocal
from tests.utils import *
import sqlalchemy as sa

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
    tu = TestUtils(client, API_PREFIX)

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


def test_start_game(tu):
    get_game_state_request = GetGameStateRequest(game_id)
    response = tu.post_data("/get_game_state", json=asdict(get_game_state_request))
    assert response.status_code == 200, response.text
    game_state_dict = response.json()

    game_state_serializable: GameStateSerializable = GameStateSerializable(**game_state_dict)
    game_state = game_state_serializable.to_normal()
    assert game_state.is_started is True
    assert game_state.turn_number is 1


def test_shoot_laser(tu):
    shoot_laser_request = ShootLaserRequest(game_id)
    get_game_state_request = GetGameStateRequest(game_id)

    response = tu.post_data("/shoot_laser", tokens[0], json=asdict(shoot_laser_request))
    assert response.status_code == 200
    response = tu.post_data("/get_game_state", json=asdict(get_game_state_request))
    assert response.status_code == 200, response.text
    game_state_dict = response.json()

    game_state_serializable: GameStateSerializable = GameStateSerializable(**game_state_dict)
    game_state = game_state_serializable.to_normal()
    assert game_state.board.cells[(5, 0)] is None
    assert game_state.board.cells[(6, 1)] is None


def test_move_block(tu):
    get_game_state_request = GetGameStateRequest(game_id)
    request = MovePieceRequest(game_id, CellCoordinatesSerializable(1, 1), CellCoordinatesSerializable(1, 2))
    response = tu.post_data("/move_piece", tokens[0], json=asdict(request))
    assert response.status_code == 200
    response = tu.post_data("/get_game_state", json=asdict(get_game_state_request))
    assert response.status_code == 200, response.text
    game_state_dict = response.json()

    game_state_serializable: GameStateSerializable = GameStateSerializable(**game_state_dict)
    game_state = game_state_serializable.to_normal()
    assert game_state.board.cells[(1, 1)] is None
    assert game_state.board.cells[(1, 2)] is not None


def test_move_block_on_own_piece(tu):
    get_game_state_request = GetGameStateRequest(game_id)
    request = MovePieceRequest(game_id, CellCoordinatesSerializable(1, 1), CellCoordinatesSerializable(2, 1))
    response = tu.post_data("/move_piece", tokens[0], json=asdict(request))
    assert response.status_code != 200
    response = tu.post_data("/get_game_state", json=asdict(get_game_state_request))
    assert response.status_code == 200, response.text
    game_state_dict = response.json()

    game_state_serializable: GameStateSerializable = GameStateSerializable(**game_state_dict)
    game_state = game_state_serializable.to_normal()
    assert game_state.board.cells[(1, 1)] is not None
    assert game_state.board.cells[(2, 1)] is not None


def test_rotate_block(tu):
    get_game_state_request = GetGameStateRequest(game_id)
    request = RotatePieceRequest(game_id, CellCoordinatesSerializable(1, 1), 90)
    response = tu.post_data("/rotate_piece", tokens[0], json=asdict(request))
    assert response.status_code == 200
    response = tu.post_data("/get_game_state", json=asdict(get_game_state_request))
    assert response.status_code == 200, response.text
    game_state_dict = response.json()

    game_state_serializable: GameStateSerializable = GameStateSerializable(**game_state_dict)
    game_state = game_state_serializable.to_normal()
    assert game_state.board.cells[(1, 1)] == Piece(PieceType.BLOCK, Player.PLAYER_ONE, 90)


def test_rotate_empty(tu):
    request = RotatePieceRequest(game_id, CellCoordinatesSerializable(3, 3), 90)
    response = tu.post_data("/rotate_piece", tokens[0], json=asdict(request))
    assert response.status_code != 200


def test_rotate_as_guest(tu):
    request = RotatePieceRequest(game_id, CellCoordinatesSerializable(1, 1), 90)
    response = tu.post_data("/rotate_piece", json=asdict(request))
    assert response.status_code == 401


def test_rotate_as_other_player(tu):
    request = RotatePieceRequest(game_id, CellCoordinatesSerializable(1, 1), 90)
    response = tu.post_data("/rotate_piece", tokens[1], json=asdict(request))
    assert response.status_code == 403


def test_rotate_hypercube(tu):
    request = RotatePieceRequest(game_id, CellCoordinatesSerializable(4, 4), 90)
    response = tu.post_data("/rotate_piece", tokens[0], json=asdict(request))
    assert response.status_code != 200


def test_rotate_block_invalid_angle(tu):
    invalid_angles = [89, 324, -1, 360, 34, 91, 271]
    for angle in invalid_angles:
        request = RotatePieceRequest(game_id, CellCoordinatesSerializable(1, 1), angle)
        response = tu.post_data("/rotate_piece", tokens[0], json=asdict(request))
        assert response.status_code != 200


def test_use_hyper_square(tu):
    request = MovePieceRequest(game_id, CellCoordinatesSerializable(4, 1), CellCoordinatesSerializable(4, 2))
    response = tu.post_data("/move_piece", tokens[0], json=asdict(request))
    assert response.status_code == 200

    request = MovePieceRequest(game_id, CellCoordinatesSerializable(4, 2), CellCoordinatesSerializable(4, 3))
    response = tu.post_data("/move_piece", tokens[0], json=asdict(request))
    assert response.status_code == 200

    request = RotatePieceRequest(game_id, CellCoordinatesSerializable(4, 7), 90)
    response = tu.post_data("/rotate_piece", tokens[1], json=asdict(request))
    assert response.status_code == 200
    response = tu.post_data("/rotate_piece", tokens[1], json=asdict(request))
    assert response.status_code == 200

    request = MovePieceRequest(game_id, CellCoordinatesSerializable(4, 3), CellCoordinatesSerializable(4, 4))
    response = tu.post_data("/move_piece", tokens[0], json=asdict(request))
    assert response.status_code == 200


def test_play_the_game(tu):
    get_game_state_request = GetGameStateRequest(game_id)

    response = tu.post_data("/get_game_state", json=asdict(get_game_state_request))
    assert response.status_code == 200, response.text
    game_state_dict = response.json()

    game_state_serializable: GameStateSerializable = GameStateSerializable(**game_state_dict)
    game_state = game_state_serializable.to_normal()
    assert game_state.is_started is True
    assert game_state.turn_number is 1

    request = MovePieceRequest(game_id, CellCoordinatesSerializable(0, 1), CellCoordinatesSerializable(0, 2))
    response = tu.post_data("/move_piece", tokens[0], json=asdict(request))
    assert response.status_code == 200
    request = RotatePieceRequest(game_id, CellCoordinatesSerializable(0, 2), 90)
    response = tu.post_data("/rotate_piece", tokens[0], json=asdict(request))
    assert response.status_code == 200
    response = tu.post_data("/get_game_state", json=asdict(get_game_state_request))
    assert response.status_code == 200, response.text
    game_state_dict = response.json()

    game_state_serializable: GameStateSerializable = GameStateSerializable(**game_state_dict)
    game_state = game_state_serializable.to_normal()
    assert game_state.is_started is True
    assert game_state.turn_number is 3
    assert game_state.board.cells[(0, 1)] is None
    assert game_state.board.cells[(0, 2)] is not None

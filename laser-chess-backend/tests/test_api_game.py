from dataclasses import asdict

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base
from app.game_engine.models import *
from app.game_engine.requests import *
from app.main import app, get_db, API_PREFIX

SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

tokens = []
game_id = "some_id"


@pytest.fixture(autouse=True)
def run_around_tests():
    global tokens, game_id
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    create_user_datas = list(map(lambda x: dict(username=f"test{x}", email=f"test{x}@example.com", password="test{x}"), range(0,2)))
    tokens = list(map(lambda create_user_data: post_create_user(create_user_data), create_user_datas))
    post_data(
        "/start_game",
        tokens[0],
        json=dict(game_id=game_id, player_one_id=create_user_datas[0]['username'], player_two_id=create_user_datas[1]['username']),
    )
    yield
    pass


def make_request(method: str, path: str, token: str = None, **kwargs):
    if token is None:
        return client.request(method, API_PREFIX + path, **kwargs)
    else:
        return client.request(method, API_PREFIX + path, headers={"Authorization": f"Bearer {token}"}, **kwargs)


def post_data(path: str, token: str = None, **kwargs):
    return make_request('POST', path, token, **kwargs)


def get_data(path: str, token: str = None, **kwargs):
    return make_request('GET', path, token, **kwargs)


def get_token_data(create_user_data):
    return dict(username=create_user_data['username'], password=create_user_data['password'])


def post_create_user(create_user_data):
    post_data("/users/", json=create_user_data)
    response = post_data("/token", data=get_token_data(create_user_data))
    token = response.json()["access_token"]
    return token


def test_start_game():
    get_game_state_request = GetGameStateRequest(game_id)
    response = post_data("/get_game_state", json=asdict(get_game_state_request))
    assert response.status_code == 200, response.text
    game_state_dict = response.json()

    game_state_serializable: GameStateSerializable = GameStateSerializable(**game_state_dict)
    game_state = game_state_serializable.to_normal()
    assert game_state.is_started is True
    assert game_state.turn_number is 1


def test_shoot_laser():
    shoot_laser_request = ShootLaserRequest(game_id)
    get_game_state_request = GetGameStateRequest(game_id)

    response = post_data("/shoot_laser", tokens[0], json=asdict(shoot_laser_request))
    assert response.status_code == 200
    response = post_data("/get_game_state", json=asdict(get_game_state_request))
    assert response.status_code == 200, response.text
    game_state_dict = response.json()

    game_state_serializable: GameStateSerializable = GameStateSerializable(**game_state_dict)
    game_state = game_state_serializable.to_normal()
    assert game_state.board.cells[(5, 0)] is None
    assert game_state.board.cells[(6, 1)] is None


def test_move_block():
    get_game_state_request = GetGameStateRequest(game_id)
    # request_dict = dict(game_id="some_id", move_from=dict(x=1, y=1), move_to=dict(x=1, y=2))
    request = MovePieceRequest(game_id, CellCoordinatesSerializable(1, 1), CellCoordinatesSerializable(1, 2))
    response = post_data("/move_piece", tokens[0], json=asdict(request))
    assert response.status_code == 200
    response = post_data("/get_game_state", json=asdict(get_game_state_request))
    assert response.status_code == 200, response.text
    game_state_dict = response.json()

    game_state_serializable: GameStateSerializable = GameStateSerializable(**game_state_dict)
    game_state = game_state_serializable.to_normal()
    assert game_state.board.cells[(1, 1)] is None
    assert game_state.board.cells[(1, 2)] is not None


def test_move_block_on_own_piece():
    get_game_state_request = GetGameStateRequest(game_id)
    request = MovePieceRequest(game_id, CellCoordinatesSerializable(1, 1), CellCoordinatesSerializable(2, 1))
    response = post_data("/move_piece", tokens[0], json=asdict(request))
    assert response.status_code != 200
    response = post_data("/get_game_state", json=asdict(get_game_state_request))
    assert response.status_code == 200, response.text
    game_state_dict = response.json()

    game_state_serializable: GameStateSerializable = GameStateSerializable(**game_state_dict)
    game_state = game_state_serializable.to_normal()
    assert game_state.board.cells[(1, 1)] is not None
    assert game_state.board.cells[(2, 1)] is not None


def test_rotate_block():
    get_game_state_request = GetGameStateRequest(game_id)
    request = RotatePieceRequest(game_id, CellCoordinatesSerializable(1, 1), 90)
    response = post_data("/rotate_piece", tokens[0], json=asdict(request))
    assert response.status_code == 200
    response = post_data("/get_game_state", json=asdict(get_game_state_request))
    assert response.status_code == 200, response.text
    game_state_dict = response.json()

    game_state_serializable: GameStateSerializable = GameStateSerializable(**game_state_dict)
    game_state = game_state_serializable.to_normal()
    assert game_state.board.cells[(1, 1)] == Piece(PieceType.BLOCK, Player.PLAYER_ONE, 90)


def test_rotate_empty():
    request = RotatePieceRequest(game_id, CellCoordinatesSerializable(3, 3), 90)
    response = post_data("/rotate_piece", tokens[0], json=asdict(request))
    assert response.status_code != 200


def test_rotate_as_guest():
    request = RotatePieceRequest(game_id, CellCoordinatesSerializable(1, 1), 90)
    response = post_data("/rotate_piece", json=asdict(request))
    assert response.status_code == 401


def test_rotate_as_other_player():
    request = RotatePieceRequest(game_id, CellCoordinatesSerializable(1, 1), 90)
    response = post_data("/rotate_piece", tokens[1], json=asdict(request))
    assert response.status_code == 403


def test_rotate_hypercube():
    request = RotatePieceRequest(game_id, CellCoordinatesSerializable(4, 4), 90)
    response = post_data("/rotate_piece", tokens[0], json=asdict(request))
    assert response.status_code != 200


def test_rotate_block_invalid_angle():
    invalid_angles = [89, 324, -1, 360, 34, 91, 271]
    for angle in invalid_angles:
        request = RotatePieceRequest(game_id, CellCoordinatesSerializable(1, 1), angle)
        response = post_data("/rotate_piece", tokens[0], json=asdict(request))
        assert response.status_code != 200


def test_use_hyper_square():
    request = MovePieceRequest(game_id, CellCoordinatesSerializable(4, 1), CellCoordinatesSerializable(4, 2))
    response = post_data("/move_piece", tokens[0], json=asdict(request))
    assert response.status_code == 200

    request = MovePieceRequest(game_id, CellCoordinatesSerializable(4, 2), CellCoordinatesSerializable(4, 3))
    response = post_data("/move_piece", tokens[0], json=asdict(request))
    assert response.status_code == 200

    request = RotatePieceRequest(game_id, CellCoordinatesSerializable(4, 7), 90)
    response = post_data("/rotate_piece", tokens[1], json=asdict(request))
    assert response.status_code == 200
    response = post_data("/rotate_piece", tokens[1], json=asdict(request))
    assert response.status_code == 200

    request = MovePieceRequest(game_id, CellCoordinatesSerializable(4, 3), CellCoordinatesSerializable(4, 4))
    response = post_data("/move_piece", tokens[0], json=asdict(request))
    assert response.status_code == 200


def test_play_the_game():
    get_game_state_request = GetGameStateRequest(game_id)

    response = post_data("/get_game_state", json=asdict(get_game_state_request))
    assert response.status_code == 200, response.text
    game_state_dict = response.json()

    game_state_serializable: GameStateSerializable = GameStateSerializable(**game_state_dict)
    game_state = game_state_serializable.to_normal()
    assert game_state.is_started is True
    assert game_state.turn_number is 1

    request = MovePieceRequest(game_id, CellCoordinatesSerializable(0, 1), CellCoordinatesSerializable(0, 2))
    response = post_data("/move_piece", tokens[0], json=asdict(request))
    assert response.status_code == 200
    request = RotatePieceRequest(game_id, CellCoordinatesSerializable(0, 2), 90)
    response = post_data("/rotate_piece", tokens[0], json=asdict(request))
    assert response.status_code == 200
    response = post_data("/get_game_state", json=asdict(get_game_state_request))
    assert response.status_code == 200, response.text
    game_state_dict = response.json()

    game_state_serializable: GameStateSerializable = GameStateSerializable(**game_state_dict)
    game_state = game_state_serializable.to_normal()
    assert game_state.is_started is True
    assert game_state.turn_number is 3
    assert game_state.board.cells[(0, 1)] is None
    assert game_state.board.cells[(0, 2)] is not None

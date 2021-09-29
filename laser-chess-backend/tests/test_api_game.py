import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base
from app.game_engine.models import *
from app.game_engine.requests import *
from app.main import app, get_db, API_PREFIX

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

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


@pytest.fixture(autouse=True)
def run_around_tests():
    global tokens
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    create_user_datas = list(map(lambda x: dict(username=f"test{x}", email=f"test{x}@example.com", password="test{x}"), range(0,2)))
    tokens = list(map(lambda create_user_data: post_create_user(create_user_data), create_user_datas))
    post_data(
        "/start_game",
        tokens[0],
        json=dict(game_id="some_id", player_one_id=create_user_datas[0]['username'], player_two_id=create_user_datas[1]['username']),
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


def test_shoot_laser():
    response = post_data("/shoot_laser", tokens[0], json=dict(game_id="some_id"))
    assert response.status_code == 200
    response = post_data("/get_game_state", json=dict(game_id="some_id"))
    assert response.status_code == 200, response.text
    game_state_dict = response.json()

    game_state_serializable: GameStateSerializable = GameStateSerializable(**game_state_dict)
    game_state = game_state_serializable.to_normal()
    assert game_state.board.cells[(5, 0)] is None
    assert game_state.board.cells[(6, 1)] is None


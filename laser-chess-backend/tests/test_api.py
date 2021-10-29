from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base
from app.game_engine.models import *
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


def make_request(method: str, path: str, token: str = None, **kwargs):
    if token is None:
        return client.request(method, API_PREFIX + path, **kwargs)
    else:
        return client.request(method, API_PREFIX + path, headers={"Authorization": f"Bearer {token}"}, **kwargs)


def post_data(path: str, token: str = None, **kwargs):
    return make_request('POST', path, token, **kwargs)


def get_data(path: str, token: str = None, **kwargs):
    return make_request('GET', path, token, **kwargs)


def test_openapi():
    response = get_data("/openapi.json")
    assert response.status_code == 200, response.text


def test_create_user():
    response = post_data("/users/", json={"username": "deadpool", "email": "deadpool@example.com", "password": "chimichangas4life"})
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["email"] == "deadpool@example.com"
    assert "id" in data
    user_id = data["id"]

    response = post_data("/token", data={"username": "deadpool", "password": "chimichangas4life"})
    assert response.status_code == 200, response.text
    data = response.json()
    assert "access_token" in data
    token = data["access_token"]

    response = get_data(f"/users/me/", token)
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["email"] == "deadpool@example.com"
    assert data["id"] == user_id


def test_start_game():
    response = post_data("/users/", json={"username": "test", "email": "test@example.com", "password": "admin123"})
    assert response.status_code == 200
    response = post_data(
        "/token",
        data={"username": "test", "password": "admin123"},
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert "access_token" in data
    token = data["access_token"]

    response = post_data("/get_game_state", json={"game_id": "some_id"})
    assert response.status_code == 404

    response = post_data("/lobby/create", token)
    assert response.status_code == 200

    response = post_data("/start_game", token,  json={"game_id": "some_id", "player_one_id": "test", "player_two_id": "test2"})
    assert response.status_code == 200

    response = post_data(
        "/get_game_state",
        json={"game_id": "some_id"},
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["player_one_id"] == "test"
    assert data["player_two_id"] == "test2"


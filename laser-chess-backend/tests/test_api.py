import json
from pprint import pprint

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base
from app.game_engine.models import *
from app.main import app, get_db

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


def test_openapi():
    response = client.get("/openapi.json")
    assert response.status_code == 200, response.text


def test_create_user():
    response = client.post(
        "/users/",
        json={"username": "deadpool", "email": "deadpool@example.com", "password": "chimichangas4life"},
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["email"] == "deadpool@example.com"
    assert "id" in data
    user_id = data["id"]

    response = client.post(
        "/token",
        data={"username": "deadpool", "password": "chimichangas4life"},
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert "access_token" in data
    token = data["access_token"]

    response = client.get(f"/users/me/", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["email"] == "deadpool@example.com"
    assert data["id"] == user_id


def test_start_game():
    response = client.post(
        "/users/",
        json={"username": "test", "email": "test@example.com", "password": "admin123"},
    )
    assert response.status_code == 200
    response = client.post(
        "/token",
        data={"username": "test", "password": "admin123"},
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert "access_token" in data
    token = data["access_token"]

    response = client.get(
        "/get_game_state",
        json={"game_id": "some_id"},
    )
    assert response.status_code == 404

    response = client.post(
        "/start_game",
        json={"game_id": "some_id", "player_one_id": "test", "player_two_id": "test2"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200

    response = client.get(
        "/get_game_state",
        json={"game_id": "some_id"},
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["player_one_id"] == "test"
    assert data["player_two_id"] == "test2"


def test_shoot_laser():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    response = client.post("/users/", json={"username": "test", "email": "test@example.com", "password": "admin123"})
    assert response.status_code == 200
    response = client.post("/token", data={"username": "test", "password": "admin123"})
    assert response.status_code == 200, response.text
    data = response.json()
    assert "access_token" in data
    token = data["access_token"]
    response = client.post(
        "/start_game",
        json={"game_id": "some_id", "player_one_id": "test", "player_two_id": "test2"},
        headers={"Authorization": f"Bearer {token}"}
    )
    response = client.post("/shoot_laser", json={"game_id": "some_id"}, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    response = client.get("/get_game_state", json={"game_id": "some_id"})
    assert response.status_code == 200, response.text
    game_state_dict = response.json()

    # print(game_state_json)
    #
    # game_state_dict = json.loads(game_state_json)
    #
    # pprint(game_state_dict)

    game_state_serializable: GameStateSerializable = GameStateSerializable(**game_state_dict)
    game_state = game_state_serializable.to_normal()
    assert game_state.board.cells[(5, 0)] is None
    assert game_state.board.cells[(6, 1)] is None



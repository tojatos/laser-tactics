import pytest

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
        map(lambda x: dict(username=f"test{x}", email=f"test{x}@example.com", password=f"test{x}"), range(0, 5)))
    tokens = list(map(lambda create_user_data: tu.post_create_user(create_user_data), create_user_datas))
    for user in create_user_datas:
        verify_user(session, user["username"])

    session.commit()


def test_create_lobby_happy(tu):
    response = tu.post_data("/lobby/create", tokens[0])
    assert response.status_code == 201
    assert response.json()["lobby_status"] == "CREATED"


def test_create_lobby_unauthorized(tu):
    response = tu.post_data("/lobby/create", "1234")
    assert response.status_code == 401


def test_join_lobby_happy(tu):
    response = tu.post_data("/lobby/create", tokens[0])
    assert response.status_code == 201
    response = tu.patch_data(f"/lobby/join", tokens[1], json={"game_id": response.json()['game_id']})
    assert response.status_code == 200


def test_join_lobby_unauthorized(tu):
    response = tu.post_data("/lobby/create", tokens[0])
    assert response.status_code == 201
    assert response.json()["lobby_status"] == "CREATED"

    response = tu.patch_data(f"/lobby/join", "1234", json={"game_id": response.json()['game_id']})
    assert response.status_code == 401


def test_join_lobby_full(tu):
    response = tu.post_data("/lobby/create", tokens[0])
    assert response.status_code == 201
    assert response.json()["lobby_status"] == "CREATED"

    response = tu.patch_data(f"/lobby/join", tokens[1], json={"game_id": response.json()['game_id']})
    assert response.status_code == 200
    assert response.json()["player_one_username"] is not None
    assert response.json()["player_two_username"] is not None

    response = tu.patch_data(f"/lobby/join", tokens[1], json={"game_id": response.json()['game_id']})
    assert response.status_code == 403


def test_join_lobby_mulitiple(tu):
    response_create = tu.post_data("/lobby/create", tokens[0])
    assert response_create.status_code == 201
    assert response_create.json()["lobby_status"] == "CREATED"

    response = tu.patch_data(f"/lobby/join", tokens[1], json={"game_id": response_create.json()['game_id']})

    assert response.status_code == 200

    response = tu.patch_data(f"/lobby/join", tokens[1], json={"game_id": response_create.json()['game_id']})
    assert response.status_code == 403

    response = tu.patch_data(f"/lobby/join", tokens[1], json={"game_id": response_create.json()['game_id']})
    assert response.status_code == 403


def test_join_lobby_notexisting(tu):
    response = tu.patch_data(f"/lobby/join", tokens[1], json={"game_id": "???"})
    assert response.status_code == 404


def test_leave_lobby_happy(tu):
    response_create = tu.post_data("/lobby/create", tokens[0])
    assert response_create.status_code == 201
    assert response_create.json()["player_one_username"] is not None
    assert response_create.json()["player_two_username"] is None

    response = tu.patch_data(f"/lobby/join", tokens[1], json={"game_id": response_create.json()['game_id']})
    assert response.status_code == 200
    assert response.json()["player_one_username"] is not None
    assert response.json()["player_two_username"] is not None

    response = tu.patch_data(f"/lobby/leave", tokens[1], json={"game_id": response_create.json()['game_id']})
    assert response.status_code == 200
    assert response.json()["player_one_username"] is not None
    assert response.json()["player_two_username"] is None


def test_leave_lobby_happy_withswap(tu):
    response_create = tu.post_data("/lobby/create", tokens[0])
    assert response_create.status_code == 201
    assert response_create.json()["player_one_username"] is not None
    assert response_create.json()["player_two_username"] is None

    response_join_1 = tu.patch_data(f"/lobby/join", tokens[1], json={"game_id": response_create.json()['game_id']})
    assert response_join_1.status_code == 200
    assert response_join_1.json()["player_one_username"] is not None
    assert response_join_1.json()["player_two_username"] is not None

    response = tu.patch_data(f"/lobby/leave", tokens[0], json={"game_id": response_create.json()['game_id']})
    assert response.status_code == 200
    assert response.json()["player_one_username"] == response_join_1.json()["player_two_username"]
    assert response.json()["player_two_username"] is None


def test_leave_lobby_unauthorized(tu):
    response = tu.post_data("/lobby/create", tokens[0])
    assert response.status_code == 201

    response = tu.patch_data(f"/lobby/leave", "1234", json={"game_id": response.json()['game_id']})
    assert response.status_code == 401


def test_leave_lobby_with_delet(tu):
    response_create = tu.post_data("/lobby/create", tokens[0])
    assert response_create.status_code == 201
    assert response_create.json()["player_one_username"] is not None
    assert response_create.json()["player_two_username"] is None

    response_join_1 = tu.patch_data(f"/lobby/join", tokens[1], json={"game_id": response_create.json()['game_id']})
    assert response_join_1.status_code == 200
    assert response_join_1.json()["player_one_username"] is not None
    assert response_join_1.json()["player_two_username"] is not None

    response = tu.patch_data(f"/lobby/leave", tokens[0], json={"game_id": response_create.json()['game_id']})
    assert response.status_code == 200
    assert response.json()["player_one_username"] == response_join_1.json()["player_two_username"]
    assert response.json()["player_two_username"] is None

    response = tu.patch_data(f"/lobby/leave", tokens[1], json={"game_id": response_create.json()['game_id']})
    assert response.status_code == 200

    response = tu.get_data(f"/lobby/{response_create.json()['game_id']}")
    assert response.status_code == 200
    assert response.json()["lobby_status"] == "ABANDONED"


def test_leave_lobby_mulitiple(tu):
    response_create = tu.post_data("/lobby/create", tokens[0])
    assert response_create.status_code == 201
    assert response_create.json()["player_one_username"] is not None
    assert response_create.json()["player_two_username"] is None

    response_join_1 = tu.patch_data(f"/lobby/join", tokens[1], json={"game_id": response_create.json()['game_id']})
    assert response_join_1.status_code == 200
    assert response_join_1.json()["player_one_username"] is not None
    assert response_join_1.json()["player_two_username"] is not None

    response = tu.patch_data(f"/lobby/leave", tokens[0], json={"game_id": response_create.json()['game_id']})
    assert response.status_code == 200
    assert response.json()["player_one_username"] == response_join_1.json()["player_two_username"]
    assert response.json()["player_two_username"] is None

    response = tu.patch_data(f"/lobby/leave", tokens[0], json={"game_id": response_create.json()['game_id']})
    assert response.status_code == 403

    response = tu.patch_data(f"/lobby/leave", tokens[0], json={"game_id": response_create.json()['game_id']})
    assert response.status_code == 403


def test_leave_lobby_notexisting(tu):
    response = tu.patch_data(f"/lobby/leave", tokens[0], json={"game_id": "????"})
    assert response.status_code == 404


def test_update_lobby_happy(tu):
    response_create = tu.post_data("/lobby/create", tokens[0])
    assert response_create.status_code == 201
    assert response_create.json()["is_private"] is False
    assert response_create.json()["is_ranked"] is False
    json = response_create.json()
    json["is_private"] = True
    json["is_ranked"] = True
    json["starting_position_reversed"] = True

    response = tu.patch_data(f"/lobby/update", token=tokens[0], json=json)
    assert response.status_code == 200
    assert response.json()["is_private"] is True
    assert response.json()["is_ranked"] is True
    assert json["starting_position_reversed"] is True


def test_update_lobby_unauthorized(tu):
    response = tu.post_data("/lobby/create", tokens[0])
    assert response.status_code == 201

    response = tu.patch_data(f"/lobby/update", token="1234")
    assert response.status_code == 401


def test_update_lobby_notexisting(tu):
    json = {
        "id": -1,
        "game_id": "string",
        "name": "string",
        "player_one_username": "string",
        "is_ranked": True,
        "is_private": True,
        "starting_position_reversed": True
    }
    response = tu.patch_data(f"/lobby/update", tokens[1], json=json)
    assert response.status_code == 404


def test_join_lobby_random_unranked(tu):
    response = tu.post_data("/lobby/create", tokens[1])
    assert response.status_code == 201
    assert response.json()["lobby_status"] == "CREATED"

    response = tu.post_data("/lobby/create", tokens[2])
    assert response.status_code == 201
    assert response.json()["lobby_status"] == "CREATED"

    response = tu.post_data("/lobby/create", tokens[3])
    assert response.status_code == 201
    assert response.json()["lobby_status"] == "CREATED"

    response = tu.post_data(f"/lobby/join_random", tokens[0],
                            json={"is_rated": False, "rating_lower_bound": 0, "rating_higher_bound": 0})
    assert response.status_code == 200
    assert response.json()["player_two_username"] == "test0"


def test_join_lobby_random_ranked(tu):
    response = tu.post_data("/lobby/create", tokens[1])
    assert response.status_code == 201
    assert response.json()["lobby_status"] == "CREATED"

    response = tu.post_data("/lobby/create", tokens[2])
    assert response.status_code == 201
    assert response.json()["lobby_status"] == "CREATED"

    response = tu.post_data("/lobby/create", tokens[3])
    assert response.status_code == 201
    assert response.json()["lobby_status"] == "CREATED"


    response = tu.post_data(f"/lobby/join_random", tokens[0],
                            json={"is_rated": True, "rating_lower_bound": 1400, "rating_higher_bound": 1600})
    assert response.status_code == 200
    assert response.json()["player_two_username"] == "test0"

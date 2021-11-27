import pytest
from tests.conftest import engine, TestingSessionLocal
from tests.utils import *
from app.main import app
from app.main import app, get_db, API_PREFIX

tokens = []


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
    session.commit()


def test_get_friends_of_user(tu):
    response = tu.get_data("/users/me/friends", tokens[0])
    assert response.status_code == 200


def test_send_friend_request(tu):
    response = tu.post_data("/users/me/friends/requests/send", tokens[0], json={"username": "test2"})
    assert response.status_code == 201


def test_get_pending_requests(tu):
    response = tu.post_data("/users/me/friends/requests/send", tokens[0], json={"username": "test2"})
    assert response.status_code == 201

    response = tu.get_data("/users/me/friends", tokens[2])
    assert response.status_code == 200


def test_accept_friend_request(tu):
    response = tu.post_data("/users/me/friends/requests/send", tokens[0], json={"username": "test2"})
    assert response.status_code == 201

    response = tu.get_data("/users/me/friends/requests", tokens[2])
    assert response.status_code == 200

    pending_requests = list(response.json())
    assert len(pending_requests) > 0

    # thats wack
    response = tu.post_data(f"/users/me/friends/requests/accept", tokens[2], json={"id" : pending_requests[0]['id']})
    assert response.status_code == 200

    response = tu.get_data("/users/me/friends/requests", tokens[2])
    assert response.status_code == 200

    pending_requests = list(response.json())
    assert len(pending_requests) == 0

    response = tu.get_data("/users/me/friends", tokens[0])
    user_1_friends = list(response.json())

    response = tu.get_data("/users/me/friends", tokens[2])
    user_2_friends = list(response.json())

    assert "test0" in user_2_friends
    assert "test2" in user_1_friends


def test_decline_friend_request(tu):
    response = tu.post_data("/users/me/friends/requests/send", tokens[0], json={"username": "test2"})
    assert response.status_code == 201

    response = tu.get_data("/users/me/friends/requests", tokens[2])
    assert response.status_code == 200

    pending_requests = list(response.json())
    assert len(pending_requests) > 0

    response = tu.post_data(f"/users/me/friends/requests/decline", tokens[2], json={"id" : pending_requests[0]['id']})
    assert response.status_code == 200

    response = tu.get_data("/users/me/friends/requests", tokens[2])
    assert response.status_code == 200

    pending_requests = list(response.json())
    assert len(pending_requests) == 0

    response = tu.get_data("/users/me/friends", tokens[0])
    user_1_friends = list(response.json())

    response = tu.get_data("/users/me/friends", tokens[2])
    user_2_friends = list(response.json())

    assert "test0" not in user_2_friends
    assert "test2" not in user_1_friends

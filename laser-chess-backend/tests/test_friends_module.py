import pytest
from tests.utils import Base, engine, post_create_user, post_data, get_data

tokens = []


@pytest.fixture(autouse=True)
def run_around_tests():
    global tokens
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    create_user_datas = list(
        map(lambda x: dict(username=f"test{x}", email=f"test{x}@example.com", password=f"test{x}"), range(0, 5)))
    tokens = list(map(lambda create_user_data: post_create_user(create_user_data), create_user_datas))
    yield
    pass


def test_get_friends_of_user():
    response = get_data("/users/me/friends", tokens[0])
    assert response.status_code == 200


def test_send_friend_request():
    response = post_data("/users/me/friends/requests/send?friend_username=test2", tokens[0])
    assert response.status_code == 201


def test_get_pending_requests():
    response = post_data("/users/me/friends/requests/send?friend_username=test2", tokens[0])
    assert response.status_code == 201

    response = get_data("/users/me/friends", tokens[2])
    assert response.status_code == 200


def test_accept_friend_request():
    response = post_data("/users/me/friends/requests/send?friend_username=test2", tokens[0])
    assert response.status_code == 201

    response = get_data("/users/me/friends/requests", tokens[2])
    assert response.status_code == 200

    # thats wack
    response = post_data(f"/users/me/friends/requests/accept?request_id={response.json()[0]['id']}", tokens[2])
    assert response.status_code == 200

    response = get_data("/users/me/friends", tokens[0])
    user_1_friends = list(response.json())

    response = get_data("/users/me/friends", tokens[2])
    user_2_friends = list(response.json())

    assert "test0" in user_2_friends
    assert "test2" in user_1_friends

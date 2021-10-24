import pytest
from tests.utils import Base, engine, post_data, patch_data, post_create_user, get_data

tokens = []


@pytest.fixture(autouse=True)
def run_around_tests():
    global tokens
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    create_user_datas = list(
        map(lambda x: dict(username=f"test{x}", email=f"test{x}@example.com", password=f"test{x}"), range(0, 3)))
    tokens = list(map(lambda create_user_data: post_create_user(create_user_data), create_user_datas))
    yield
    pass


def test_create_lobby_happy():
    response = post_data("/lobby/create", tokens[0])
    assert response.status_code == 200


def test_get_lobbys():
    response = post_data("/lobby/create", tokens[0])
    assert response.status_code == 200
    response = post_data("/lobby/create", tokens[0])
    assert response.status_code == 200
    response = get_data("/lobby")
    assert response.status_code == 200
    print(response.json())


def test_create_lobby_unauthorized():
    response = post_data("/lobby/create", "1234")
    assert response.status_code == 401


def test_join_lobby_happy():
    response = post_data("/lobby/create", tokens[0])
    assert response.status_code == 200
    response = patch_data(f"/lobby/join?lobby_id={response.json()['id']}", tokens[1])
    assert response.status_code == 200


def test_join_lobby_unauthorized():
    response = post_data("/lobby/create", tokens[0])
    assert response.status_code == 200

    response = patch_data(f"/lobby/join?lobby_id={response.json()['id']}", tokens[1])
    assert response.status_code == 200


def test_join_lobby_full():
    response = post_data("/lobby/create", tokens[0])
    assert response.status_code == 200

    response = patch_data(f"/lobby/join?lobby_id={response.json()['id']}", tokens[1])
    assert response.status_code == 200

    response = patch_data(f"/lobby/join?lobby_id={response.json()['id']}", tokens[1])
    assert response.status_code == 403


def test_join_lobby_mulitiple():
    response_create = post_data("/lobby/create", tokens[0])
    assert response_create.status_code == 200

    response = patch_data(f"/lobby/join?lobby_id={response_create.json()['id']}", tokens[1])
    assert response.status_code == 200

    response = patch_data(f"/lobby/join?lobby_id={response_create.json()['id']}", tokens[1])
    assert response.status_code == 403

    response = patch_data(f"/lobby/join?lobby_id={response_create.json()['id']}", tokens[1])
    assert response.status_code == 403


def test_join_lobby_notexisting():
    response = patch_data(f"/lobby/join?lobby_id=9999999", tokens[1])
    assert response.status_code == 404


"""
def test_leave_lobby_happy():
    pass


def test_leave_lobby_unauthorized():
    pass


def test_leave_lobby_full():
    pass


def test_leave_lobby_mulitiple():
    pass


def test_leave_lobby_notexisting():
    pass


def test_update_lobby_happy():
    pass


def test_update_lobby_unauthorized():
    pass


def test_update_lobby_full():
    pass


def test_update_lobby_mulitiple():
    pass


def test_update_lobby_notexisting():
    pass
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base
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

    create_user_datas = list(
        map(lambda x: dict(username=f"test{x}", email=f"test{x}@example.com", password=f"test{x}"), range(0, 3)))
    tokens = list(map(lambda create_user_data: post_create_user(create_user_data), create_user_datas))
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


def patch_data(path: str, token: str = None, **kwargs):
    return make_request('PATCH', path, token, **kwargs)


def get_token_data(create_user_data):
    return dict(username=create_user_data['username'], password=create_user_data['password'])


def post_create_user(create_user_data):
    post_data("/users/", json=create_user_data)
    response = post_data("/token", data=get_token_data(create_user_data))
    token = response.json()["access_token"]
    return token


def test_create_lobby_happy():
    response = post_data("/lobby/create", tokens[0])
    assert response.status_code == 201


def test_get_lobbys():
    response = post_data("/lobby/create", tokens[0])
    assert response.status_code == 201
    response = post_data("/lobby/create", tokens[0])
    assert response.status_code == 201
    response = get_data("/lobby")
    assert response.status_code == 200
    print(response.json())


def test_create_lobby_unauthorized():
    response = post_data("/lobby/create", "1234")
    assert response.status_code == 401


def test_join_lobby_happy():
    response = post_data("/lobby/create", tokens[0])
    assert response.status_code == 201
    response = patch_data(f"/lobby/join?lobby_id={response.json()['id']}", tokens[1])
    assert response.status_code == 200


def test_join_lobby_unauthorized():
    response = post_data("/lobby/create", tokens[0])
    assert response.status_code == 201

    response = patch_data(f"/lobby/join?lobby_id={response.json()['id']}", tokens[1])
    assert response.status_code == 200


def test_join_lobby_full():
    response = post_data("/lobby/create", tokens[0])
    assert response.status_code == 201

    response = patch_data(f"/lobby/join?lobby_id={response.json()['id']}", tokens[1])
    assert response.status_code == 200

    response = patch_data(f"/lobby/join?lobby_id={response.json()['id']}", tokens[1])
    assert response.status_code == 403


def test_join_lobby_mulitiple():
    response_create = post_data("/lobby/create", tokens[0])
    assert response_create.status_code == 201

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

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


def make_request(method: str, path: str, token: str = None, **kwargs):
    if token is None:
        return client.request(method, API_PREFIX + path, **kwargs)
    else:
        return client.request(method, API_PREFIX + path, headers={"Authorization": f"Bearer {token}"}, **kwargs)


def post_data(path: str, token: str = None, **kwargs):
    return make_request('POST', path, token, **kwargs)


def get_data(path: str, token: str = None, **kwargs):
    return make_request('GET', path, token, **kwargs)


def test_create_lobby_happy():
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

    response = post_data("/lobby/create", token)
    assert response.status_code == 200


def test_create_lobby_unauthorized():
    response = post_data("/lobby/create", "1234")
    assert response.status_code == 403


def test_join_lobby_happy():
    pass


def test_join_lobby_unauthorized():
    pass


def test_join_lobby_full():
    pass


def test_join_lobby_mulitiple():
    pass


def test_join_lobby_notexisting():
    pass


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

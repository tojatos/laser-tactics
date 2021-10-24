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


def patch_data(path: str, token: str = None, **kwargs):
    return make_request('PATCH', path, token, **kwargs)


def get_token_data(create_user_data):
    return dict(username=create_user_data['username'], password=create_user_data['password'])


def post_create_user(create_user_data):
    post_data("/users/", json=create_user_data)
    response = post_data("/token", data=get_token_data(create_user_data))
    token = response.json()["access_token"]
    return token
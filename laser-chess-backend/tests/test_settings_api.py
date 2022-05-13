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
        map(lambda x: dict(username=f"test{x}", email=f"test{x}@example.com", password=f"test{x}"), range(0, 2)))
    tokens = list(map(lambda create_user_data: tu.post_create_user(create_user_data), create_user_datas))
    for user in create_user_datas:
        verify_user(session, user["username"])

    session.commit()


def test_get_settings(tu):
    response = tu.get_data("/users/me/settings", tokens[0])
    assert response.status_code == 200
    assert response.json()["skip_animations"] == False
    assert response.json()["sound_on"] == True
    assert response.json()["theme"] == "DEFAULT"


def test_change_settings(tu):
    response = tu.patch_data("/users/me/settings", tokens[0],
                             json={"skip_animations": True, "sound_on": False, "theme": "WODDEN1"})
    assert response.status_code == 200
    assert response.json()["skip_animations"] == True
    assert response.json()["sound_on"] == False
    assert response.json()["theme"] == "WODDEN1"

    response = tu.get_data("/users/me/settings", tokens[0])
    assert response.status_code == 200
    assert response.json()["skip_animations"] == True
    assert response.json()["sound_on"] == False


def test_change_settings2(tu):
    response = tu.patch_data("/users/me/settings", tokens[0],
                             json={"skip_animations": True, "sound_on": False, "theme": "WODDEN3"})
    assert response.status_code == 422

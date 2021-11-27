import pytest

from app.core.internal import models
from tests.test_rating import glickman_matches_in_db
from app.main import app, get_db, API_PREFIX
from tests.conftest import engine, TestingSessionLocal
from tests.utils import *

tokens = []
game_id = "some_id"


@pytest.fixture(scope="session", autouse=True)
def before_all():
    models.Base.metadata.drop_all(bind=engine)
    models.Base.metadata.create_all(bind=engine)
    global tokens

    connection = engine.connect()
    session = TestingSessionLocal(bind=connection)

    def override_get_db():
        yield session

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    tu = TUtils(client, API_PREFIX)

    create_user_datas = list(
        map(lambda x: dict(username=f"test{x}", email=f"test{x}@example.com", password=f"test{x}"), range(0, 9)))
    tokens = list(map(lambda create_user_data: tu.post_create_user(create_user_data), create_user_datas))
    for user in create_user_datas:
        verify_user(session, user["username"])

    session.commit()
    glickman_matches_in_db(session)


def test_stats(tu):
    response = tu.get_data("/users/test0/stats")
    assert response.status_code == 200
    assert response.json()["matches"] == 3
    assert response.json()["wins"] == 1
    assert response.json()["draws"] == 0
    assert response.json()["loses"] == 2
    assert response.json()["winrate"] == 0.33
    assert response.json()["winrate_as_p1"] == 0.33
    assert response.json()["winrate_as_p2"] == 0.00
    assert response.json()["drawrate"] == 0.00

    response = tu.get_data("/users/test1/stats")
    assert response.status_code == 200
    assert response.json()["matches"] == 1
    assert response.json()["wins"] == 0
    assert response.json()["draws"] == 0
    assert response.json()["loses"] == 1
    assert response.json()["winrate"] == 0.00
    assert response.json()["winrate_as_p1"] == 0.00
    assert response.json()["winrate_as_p2"] == 0.00
    assert response.json()["drawrate"] == 0.00

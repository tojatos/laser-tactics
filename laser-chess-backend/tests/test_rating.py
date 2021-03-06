from app.Rating import rating, schemas
from app.Rating.schemas import PlayerMatchHistory
from app.core.internal.crud import update_user_rating, update_ratings_in_history
import pytest
from app.core.internal.models import GameHistory
from app.core.internal.schemas import GameResult
from tests.conftest import engine, TestingSessionLocal
from tests.utils import *
from app.main import app, get_db, API_PREFIX
from datetime import datetime, timedelta

GAME_ID = "some_id"


def glickman():
    player = schemas.PlayerRatingUpdate(rating=1500, rating_deviation=200, volatility=0.06)
    matches = [schemas.PlayerMatchResult(player2_rating=1400, player2_rating_deviation=30, result=1),
               schemas.PlayerMatchResult(player2_rating=1550, player2_rating_deviation=100, result=0),
               schemas.PlayerMatchResult(player2_rating=1700, player2_rating_deviation=300, result=0)]
    return player, schemas.PlayerMatchHistory(matches=matches)


def mock_match_end_in_db(db,
                         player_one_username,
                         player_one_rating,
                         player_one_deviation,
                         player_one_volatility,
                         player_two_username,
                         player_two_rating,
                         player_two_deviation,
                         player_two_volatility,
                         result,
                         game_end_date,
                         game_id):
    record = GameHistory(
        game_id=game_id,
        player_one_username=player_one_username,
        player_one_rating=player_one_rating,
        player_one_deviation=player_one_deviation,
        player_one_volatility=player_one_volatility,
        player_two_username=player_two_username,
        player_two_rating=player_two_rating,
        player_two_deviation=player_two_deviation,
        player_two_volatility=player_two_volatility,
        result=result,
        game_end_date=game_end_date,
        is_rated=True,
    )
    db.add(record)
    db.commit()
    update_user_rating(db, player_one_username)
    update_user_rating(db, player_two_username)
    update_ratings_in_history(db, game_id, player_one_username, player_two_username)


def single_in_db(db):
    datetime_object = datetime.now()
    mock_match_end_in_db(db, player_one_username="test8",
                         player_one_rating=1500,
                         player_one_deviation=200,
                         player_one_volatility=0.06,
                         player_two_username="test9",
                         player_two_rating=1500,
                         player_two_deviation=200,
                         player_two_volatility=0.06,
                         result=GameResult.PLAYER_TWO_WIN,
                         game_end_date=datetime_object,
                         game_id="100")


def glickman_matches_in_db(db):
    # 1
    datetime_object = datetime.now()
    mock_match_end_in_db(db, player_one_username="test0",
                         player_one_rating=1500,
                         player_one_deviation=200,
                         player_one_volatility=0.06,
                         player_two_username="test1",
                         player_two_rating=1400,
                         player_two_deviation=30,
                         player_two_volatility=0.06,
                         result=GameResult.PLAYER_ONE_WIN,
                         game_end_date=datetime_object,
                         game_id="1")
    # 2
    datetime_object = datetime.now() + timedelta(days=1)
    mock_match_end_in_db(db, player_one_username="test0",
                         player_one_rating=0000,
                         player_one_deviation=0000,
                         player_one_volatility=0.06,
                         player_two_username="test2",
                         player_two_rating=1550,
                         player_two_deviation=100,
                         player_two_volatility=0.06,
                         result=GameResult.PLAYER_TWO_WIN,
                         game_end_date=datetime_object,
                         game_id="2")
    # 3
    datetime_object = datetime.now() + timedelta(days=2)
    mock_match_end_in_db(db, player_one_username="test0",
                         player_one_rating=0000,
                         player_one_deviation=000,
                         player_one_volatility=0.06,
                         player_two_username="test3",
                         player_two_rating=1700,
                         player_two_deviation=300,
                         player_two_volatility=0.06,
                         result=GameResult.PLAYER_TWO_WIN,
                         game_end_date=datetime_object,
                         game_id="3")


def glickman_matches_in_db_schuffled(db):
    # 1
    datetime_object = datetime.now()
    mock_match_end_in_db(db, player_two_username="test4",
                         player_two_rating=1500,
                         player_two_deviation=200,
                         player_one_volatility=0.06,
                         player_one_username="test5",
                         player_one_rating=1400,
                         player_one_deviation=30,
                         player_two_volatility=0.06,
                         result=GameResult.PLAYER_TWO_WIN,
                         game_end_date=datetime_object,
                         game_id="4")
    # 2
    datetime_object = datetime.now() + timedelta(days=1)
    mock_match_end_in_db(db, player_one_username="test4",
                         player_one_rating=0000,
                         player_one_deviation=0000,
                         player_one_volatility=0.06,
                         player_two_username="test6",
                         player_two_rating=1550,
                         player_two_deviation=100,
                         player_two_volatility=0.06,
                         result=GameResult.PLAYER_TWO_WIN,
                         game_end_date=datetime_object,
                         game_id="5")
    # 3
    datetime_object = datetime.now() + timedelta(days=2)
    mock_match_end_in_db(db, player_two_username="test4",
                         player_two_rating=0000,
                         player_two_deviation=000,
                         player_two_volatility=0.06,
                         player_one_username="test7",
                         player_one_rating=1700,
                         player_one_deviation=300,
                         player_one_volatility=0.06,
                         result=GameResult.PLAYER_ONE_WIN,
                         game_end_date=datetime_object,
                         game_id="6")


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
        map(lambda x: dict(username=f"test{x}", email=f"test{x}@example.com", password=f"test{x}"), range(0, 10)))
    tokens = list(map(lambda create_user_data: tu.post_create_user(create_user_data), create_user_datas))
    for user in create_user_datas:
        verify_user(session, user["username"])
    session.commit()


# need to test for inconsistent performance
def test_og_calc():
    player, matches = glickman()
    new_rating = rating.update_rating(player, matches)
    assert new_rating.rating == 1464
    assert new_rating.rating_deviation == 151.51651
    assert new_rating.volatility == 0.05999


def test_empty():
    player, matches = glickman()
    matches = PlayerMatchHistory(matches=[])
    new_rating = rating.update_rating(player, matches)
    assert new_rating.rating == 1500
    assert new_rating.rating_deviation == 200.27142
    assert new_rating.volatility == 0.06


# changes stay in db - how to roll back?
def test_glickman():
    connection = engine.connect()
    session = TestingSessionLocal(bind=connection)

    def override_get_db():
        yield session

    app.dependency_overrides[get_db] = override_get_db
    glickman_matches_in_db(session)
    rating = crud.get_player_rating(session, "test0")
    assert rating.rating == 1464
    assert rating.rating_deviation == 151.51651
    assert rating.rating_volatility == 0.05999
    record = crud.get_match_record(session, "3")
    assert record.player_one_new_rating == 1464

    session.rollback()


def test_glickman_schuffled():
    connection = engine.connect()
    session = TestingSessionLocal(bind=connection)

    def override_get_db():
        yield session

    app.dependency_overrides[get_db] = override_get_db
    glickman_matches_in_db_schuffled(session)
    rating = crud.get_player_rating(session, "test4")
    assert rating.rating == 1464
    assert rating.rating_deviation == 151.51651
    assert rating.rating_volatility == 0.05999
    record = crud.get_match_record(session, "6")
    assert record.player_two_new_rating == 1464
    session.rollback()


def test_single():
    connection = engine.connect()
    session = TestingSessionLocal(bind=connection)

    def override_get_db():
        yield session

    app.dependency_overrides[get_db] = override_get_db
    single_in_db(session)
    rating = crud.get_player_rating(session, "test8")
    assert rating.rating == 1421
    assert rating.rating_deviation == 180.07829
    assert rating.rating_volatility == 0.06
    rating = crud.get_player_rating(session, "test9")
    assert rating.rating == 1578
    assert rating.rating_deviation == 180.07829
    assert rating.rating_volatility == 0.06
    record = crud.get_match_record(session, "100")
    assert record.player_one_username == "test8"
    assert record.player_one_rating == 1500
    assert record.player_one_deviation == 200
    assert record.player_one_volatility == 0.06
    assert record.player_two_username == "test9"
    assert record.player_two_rating == 1500
    assert record.player_two_deviation == 200
    assert record.player_two_volatility == 0.06
    assert record.result == GameResult.PLAYER_TWO_WIN
    assert record.game_id == "100"
    assert record.player_one_new_rating == 1421
    assert record.player_two_new_rating == 1578

    session.rollback()

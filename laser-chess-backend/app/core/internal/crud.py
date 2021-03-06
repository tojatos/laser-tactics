import dataclasses
import json
from datetime import datetime, timedelta

from pydantic import EmailStr
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.core.internal import schemas, models
from passlib.context import CryptContext

from app.core.internal.schemas import LobbyStatus, GameResult
from app.game_engine.models import GameState, GamePhase
from app.game_engine.requests import StartGameRequest
from uuid import uuid4
from app.Rating.schemas import PlayerMatchResult, PlayerMatchHistory, PlayerRatingUpdate
from app.Rating.rating import get_starting_rating, update_rating
from app.chat.models import GameChat, Message

RATING_PERIOD = 30
# max days we get matches from
HISTORY_MATCH_GET_LIMIT = 1825

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password):
    return pwd_context.hash(password)


def get_user(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == EmailStr(email)).first()


def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()


def get_users_by_rating(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).order_by(models.User.rating.desc()).offset(skip).limit(limit).all()


def verify_user(user: schemas.User, db: Session):
    user.is_verified = True
    user.verification_date = datetime.now()
    db.add(user)
    db.commit()
    return user


def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    starting_rating = get_starting_rating()
    db_user = models.User(username=user.username, email=user.email, hashed_password=hashed_password,
                          registration_date=datetime.now(), rating=starting_rating.rating,
                          rating_deviation=starting_rating.rating_deviation,
                          rating_volatility=starting_rating.volatility)
    user_settings = models.UserSettings(username=user.username)
    db.add(db_user)
    db.add(user_settings)
    db.commit()
    db.refresh(db_user)
    db.refresh(user_settings)
    return db_user


def change_password(user: schemas.User, new_password: str, db: Session):
    db_user = get_user(db, user.username)
    hashed_password = get_password_hash(new_password)
    db_user.hashed_password = hashed_password
    db.commit()
    db.refresh(db_user)
    return {"detail": "password change successful"}


def create_lobby(db: Session, user: schemas.User):
    db_lobby = models.Lobby(name=f"{user.username}'s game", game_id=str(uuid4()), player_one_username=user.username,
                            lobby_status=LobbyStatus.CREATED, lobby_creation_date=datetime.now())
    db.add(db_lobby)
    db.commit()
    db.refresh(db_lobby)
    return db_lobby


def get_lobbies(db: Session, skip: int = 0, limit: int = 100):
    lobbies = db.query(models.Lobby).offset(skip).limit(limit).all()
    return lobbies


def get_created_lobbies(db: Session, skip: int = 0, limit: int = 100):
    lobbies = db.query(models.Lobby).filter(models.Lobby.lobby_status == LobbyStatus.CREATED).offset(skip).limit(
        limit).all()
    return lobbies


def get_user_in_created_lobbies(db: Session, user: schemas.User):
    lobbies = db.query(models.Lobby).filter(
        and_(models.Lobby.lobby_status == LobbyStatus.CREATED, or_(models.Lobby.player_one_username == user.username,
                                                                   models.Lobby.player_two_username == user.username))).all()
    return lobbies


def get_lobby(db: Session, game_id: str):
    return db.query(models.Lobby).filter(models.Lobby.game_id == game_id).first()


def join_lobby(db: Session, user: schemas.User, lobby: schemas.Lobby):
    lobby.player_two_username = user.username
    db.commit()
    db.refresh(lobby)
    return lobby


def leave_lobby(db: Session, user: schemas.User, lobby: schemas.Lobby):
    if lobby.player_one_username == user.username:
        lobby.player_one_username = lobby.player_two_username
        lobby.player_two_username = None
    elif lobby.player_two_username == user.username:
        lobby.player_two_username = None
    if lobby.player_two_username is None and lobby.player_one_username is None:
        lobby.lobby_status = LobbyStatus.ABANDONED
    db.commit()
    db.refresh(lobby)
    return lobby


def update_lobby(db: Session, lobby: schemas.Lobby, lobby_new_data: schemas.LobbyEditData):
    lobby.name = lobby_new_data.name
    lobby.is_ranked = lobby_new_data.is_ranked
    lobby.is_private = lobby_new_data.is_private
    lobby.is_timed = lobby_new_data.is_timed
    lobby.player_one_time = lobby_new_data.player_one_time
    lobby.player_two_time = lobby_new_data.player_two_time
    lobby.starting_position_reversed = lobby_new_data.starting_position_reversed
    db.commit()
    db.refresh(lobby)
    return lobby


def get_users_friends(user: schemas.User, db: Session):
    friends_right = [d['user_two_username'] for d in db.query(models.FriendRequests.user_two_username).filter(and_(
        user.username == models.FriendRequests.user_one_username,
        models.FriendRequests.status == schemas.FriendRequestStatus.ACCEPTED))]
    friends_left = [d['user_one_username'] for d in db.query(models.FriendRequests.user_one_username).filter(and_(
        user.username == models.FriendRequests.user_two_username,
        models.FriendRequests.status == schemas.FriendRequestStatus.ACCEPTED))]
    return friends_left + friends_right


def get_friend_request(id: str, db: Session):
    return db.query(models.FriendRequests).filter(models.FriendRequests.id == id).first()


def get_friend_record(user: schemas.User, friend: schemas.User, db: Session):
    return db.query(models.FriendRequests).filter(
        or_(False, and_(models.FriendRequests.user_two_username == friend.username,
                        models.FriendRequests.user_one_username == user.username),
            and_(models.FriendRequests.user_two_username == user.username,
                 models.FriendRequests.user_one_username == friend.username))).first()


def get_pending_friend_request(id: str, db: Session):
    return db.query(models.FriendRequests).filter(and_(
        models.FriendRequests.id == id, models.FriendRequests.status == schemas.FriendRequestStatus.PENDING)).first()


def get_users_pending_friend_requests(user: schemas.User, db: Session):
    return list(db.query(models.FriendRequests).filter(
        and_(models.FriendRequests.user_two_username == user.username,
             models.FriendRequests.status == schemas.FriendRequestStatus.PENDING)))


def create_friend_request(user_sending: schemas.User, user_sent_to: schemas.User, db: Session):
    request = models.FriendRequests(id=str(uuid4()), user_one_username=user_sending.username,
                                    user_two_username=user_sent_to.username,
                                    status=schemas.FriendRequestStatus.PENDING)
    db.add(request)
    db.commit()
    db.refresh(request)
    return request


def accept_friend_request(friend_request: schemas.FriendRequest, db: Session):
    friend_request.status = schemas.FriendRequestStatus.ACCEPTED
    db.commit()
    db.refresh(friend_request)
    return friend_request


def decline_friend_request(friend_request: schemas.FriendRequest, db: Session):
    friend_request.status = schemas.FriendRequestStatus.REJECTED
    db.commit()
    db.refresh(friend_request)
    return friend_request


def delete_friend_record(user: schemas.User, friend: schemas.User, db: Session):
    record = get_friend_record(user, friend, db)
    if record:
        db.delete(record)
        db.commit()
        return {f"msg": f"Friend {friend.username} of user {user.username} removed"}
    return {"msg": "No friend record to delete found"}


def get_blocked_users(user: schemas.User, db: Session):
    return [d.blocked_user for d in db.query(models.BlockedUsers).filter(models.BlockedUsers.user == user.username)]


def get_block_record(user: schemas.User, blocked: schemas.User, db: Session):
    return db.query(models.BlockedUsers).filter(and_(models.BlockedUsers.user == user.username,
                                                     models.BlockedUsers.blocked_user == blocked.username)).first()


def create_block_record(user: schemas.User, user_to_block: schemas.User, db: Session):
    record = models.BlockedUsers(user=user.username, blocked_user=user_to_block.username)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_random_lobby(params: schemas.JoinRandomRequest, db: Session):
    def rating_in_bounds(params: schemas.JoinRandomRequest, lobby: models.Lobby):
        opponent = get_user(db, lobby.player_one_username)
        if not params.is_rated:
            return True
        elif params.rating_lower_bound < opponent.rating < params.rating_higher_bound:
            return True
        else:
            return False

    lobbys = db.query(models.Lobby).filter(
        and_(models.Lobby.lobby_status == LobbyStatus.CREATED, models.Lobby.is_ranked == params.is_rated,
             models.Lobby.player_two_username == None)).all()
    for lobby in lobbys:
        if rating_in_bounds(params, lobby):
            return lobby
    return None


def dispose_abandoned_lobby(db: Session):
    lobbys = db.query(models.Lobby).filter(and_(models.Lobby.lobby_status == LobbyStatus.CREATED,
                                                (datetime.now() - models.Lobby.lobby_creation_date) > timedelta(
                                                    hours=3))).all()
    for lobby in lobbys:
        lobby.lobby_status = LobbyStatus.ABANDONED
    db.commit()


def remove_block_record(user: schemas.User, blocked_user: schemas.User, db: Session):
    record = get_block_record(user=user, blocked=blocked_user, db=db)
    if record:
        db.delete(record)
        db.commit()
        return {f"msg": f"Blocked user {blocked_user.username} of user {user.username} removed"}
    return {"msg": "No blocked record to delete found"}


def get_game_state_table(db: Session, game_id: str):
    return db.query(models.GameStateTable).filter(models.GameStateTable.game_id == game_id).first()


def start_game(db: Session, game_state: GameState, request: StartGameRequest):
    lobby = get_lobby(db, request.game_id)
    game_state_json = json.dumps(dataclasses.asdict(game_state.to_serializable()))
    db_game_state = models.GameStateTable(player_one_id=request.player_one_id,
                                          player_two_id=request.player_two_id,
                                          game_id=request.game_id,
                                          game_state_json=game_state_json,
                                          )
    db.add(db_game_state)
    db_chat = models.ChatMessegesTable(game_id=request.game_id,
                                       messages_json=str([])
                                       )
    db.add(db_chat)
    if lobby is not None:
        lobby.lobby_status = LobbyStatus.GAME_STARTED

    db.commit()
    db.refresh(db_game_state)
    return db_game_state


def get_player_rating(db: Session, username: str):
    db_user = get_user(db, username)
    rating = schemas.UserRating(username=db_user.username, rating=db_user.rating,
                                rating_deviation=db_user.rating_deviation, rating_volatility=db_user.rating_volatility)
    return rating


# gets users rating from before last match in rating period
def get_users_last_rating(db: Session, username: str, rating_period: int = RATING_PERIOD):
    user = get_user(db, username)
    crossout_date = datetime.now() - timedelta(days=rating_period)
    match_left = db.query(models.GameHistory).filter(
        and_(models.GameHistory.player_one_username == user.username,
             models.GameHistory.game_end_date > crossout_date, models.GameHistory.is_rated == True)).order_by(
        models.GameHistory.game_end_date).first()
    match_right = db.query(models.GameHistory).filter(
        and_(models.GameHistory.player_two_username == user.username,
             models.GameHistory.game_end_date > crossout_date, models.GameHistory.is_rated == True)).order_by(
        models.GameHistory.game_end_date).first()
    # None checks in case any or both matches are none
    if match_right is None and match_left is None:
        rating = get_player_rating(db, username)
        return PlayerRatingUpdate(rating=rating.rating,
                                  rating_deviation=rating.rating_deviation,
                                  volatility=rating.rating_volatility)
    elif match_left is None:
        return PlayerRatingUpdate(rating=match_right.player_two_rating,
                                  rating_deviation=match_right.player_two_deviation,
                                  volatility=match_right.player_two_volatility)
    elif match_right is None:
        return PlayerRatingUpdate(rating=match_left.player_one_rating,
                                  rating_deviation=match_left.player_one_deviation,
                                  volatility=match_left.player_one_volatility)
    # actual comparison
    if match_left.game_end_date > match_right.game_end_date:
        return PlayerRatingUpdate(rating=match_right.player_two_rating,
                                  rating_deviation=match_right.player_two_deviation,
                                  volatility=match_right.player_two_volatility)
    else:
        return PlayerRatingUpdate(rating=match_left.player_one_rating,
                                  rating_deviation=match_left.player_one_deviation,
                                  volatility=match_left.player_one_volatility)


def update_game(db: Session, game_state: GameState, game_id: str):
    game_state_json = json.dumps(dataclasses.asdict(game_state.to_serializable()))
    db_game_state = get_game_state_table(db, game_id)
    db_game_state.game_state_json = game_state_json

    def map_gameResult(game_phase: GamePhase):
        if game_phase == GamePhase.DRAW:
            return schemas.GameResult.DRAW
        elif game_phase == GamePhase.PLAYER_ONE_VICTORY:
            return schemas.GameResult.PLAYER_ONE_WIN
        elif game_phase == GamePhase.PLAYER_TWO_VICTORY:
            return schemas.GameResult.PLAYER_TWO_WIN
        else:
            return None

    if game_state.game_phase in [GamePhase.DRAW, GamePhase.PLAYER_ONE_VICTORY, GamePhase.PLAYER_TWO_VICTORY]:
        player_one_rating = get_player_rating(db, game_state.player_one_id)
        player_two_rating = get_player_rating(db, game_state.player_two_id)
        record = models.GameHistory(
            game_id=game_id,
            player_one_username=player_one_rating.username,
            player_one_rating=player_one_rating.rating,
            player_one_deviation=player_one_rating.rating_deviation,
            player_one_volatility=player_one_rating.rating_volatility,
            player_two_username=player_two_rating.username,
            player_two_rating=player_two_rating.rating,
            player_two_deviation=player_two_rating.rating_deviation,
            player_two_volatility=player_two_rating.rating_volatility,
            result=map_gameResult(game_state.game_phase),
            game_end_date=datetime.now(),
            is_rated=game_state.is_rated,
            player_one_new_rating=None,
            player_two_new_rating=None
        )
        db.add(record)
        db.commit()
        if record.is_rated:
            update_user_rating(db, player_one_rating.username)
            update_user_rating(db, player_two_rating.username)
            update_ratings_in_history(db, game_id, player_one_rating.username, player_two_rating.username)

        lobby = get_lobby(db, game_id)
        if lobby is not None:
            lobby.lobby_status = LobbyStatus.GAME_ENDED
    db.commit()


def update_ratings_in_history(db: Session, game_id: str, player_one_username: str, player_two_username: str):
    record = db.query(models.GameHistory).filter(models.GameHistory.game_id == game_id).first()
    if record:
        player_one_rating = get_user(db, player_one_username).rating
        player_two_rating = get_user(db, player_two_username).rating
        record.player_one_new_rating = player_one_rating
        record.player_two_new_rating = player_two_rating
        db.commit()
        db.refresh(record)


def update_user_rating_in_db(db: Session, rating: schemas.UserRating):
    db_user = get_user(db, rating.username)
    db_user.rating = rating.rating
    db_user.rating_deviation = rating.rating_deviation
    db_user.rating_volatility = rating.rating_volatility
    db.commit()
    db.refresh(db_user)
    return rating


# rating period in days, ranked matches only
def get_user_matches(db: Session, user: schemas.User, rating_period: int):
    def determine_result_player_one(result):
        if result == GameResult.PLAYER_ONE_WIN:
            return 1
        elif result == GameResult.DRAW:
            return 0.5
        else:
            return 0

    def determine_result_player_two(result):
        if result == GameResult.PLAYER_TWO_WIN:
            return 1
        elif result == GameResult.DRAW:
            return 0.5
        else:
            return 0

    crossout_date = datetime.now() - timedelta(days=rating_period)
    all_matches = db.query(models.GameHistory).all()
    matches_left = db.query(models.GameHistory).filter(
        and_(models.GameHistory.player_one_username == user.username, models.GameHistory.game_end_date > crossout_date,
             models.GameHistory.is_rated == True)).all()
    matches_right = db.query(models.GameHistory).filter(
        and_(models.GameHistory.player_two_username == user.username, models.GameHistory.game_end_date > crossout_date,
             models.GameHistory.is_rated == True)).all()
    list_left = [PlayerMatchResult(player2_rating=match.player_two_rating,
                                   player2_rating_deviation=match.player_two_deviation,
                                   result=determine_result_player_one(match.result)) for
                 match in matches_left]
    list_right = [PlayerMatchResult(player2_rating=match.player_one_rating,
                                    player2_rating_deviation=match.player_one_deviation,
                                    result=determine_result_player_two(match.result)) for
                  match in matches_right]
    return PlayerMatchHistory(matches=(list_left + list_right))


def update_user_rating(db: Session, username: str):
    player = get_user(db, username)
    user_rating = get_users_last_rating(db, username, RATING_PERIOD)
    matches = get_user_matches(db, player, RATING_PERIOD)
    new_rating = update_rating(
        PlayerRatingUpdate(rating=user_rating.rating, rating_deviation=user_rating.rating_deviation,
                           volatility=user_rating.volatility), matches)
    new_user_rating = schemas.UserRating(username=player.username, rating=new_rating.rating,
                                         rating_deviation=new_rating.rating_deviation,
                                         rating_volatility=new_rating.volatility)
    update_user_rating_in_db(db, new_user_rating)


def get_match_record(db: Session, game_id: str):
    return db.query(models.GameHistory).filter(models.GameHistory.game_id == game_id).first()


def get_last_20_matches(db: Session, user: schemas.User):
    crossout_date = datetime.now() - timedelta(days=HISTORY_MATCH_GET_LIMIT)
    matches_left = db.query(models.GameHistory).filter(
        and_(models.GameHistory.player_one_username == user.username,
             models.GameHistory.game_end_date > crossout_date)).order_by(models.GameHistory.game_end_date).limit(
        20).all()
    matches_right = db.query(models.GameHistory).filter(
        and_(models.GameHistory.player_two_username == user.username,
             models.GameHistory.game_end_date > crossout_date)).order_by(models.GameHistory.game_end_date).limit(
        20).all()
    if not matches_left and not matches_right:
        return []
    elif not matches_left:
        matches_sum = matches_right
    elif not matches_right:
        matches_sum = matches_left
    else:
        matches_sum = matches_left + matches_right
    matches = sorted(matches_sum, key=lambda match: match.game_end_date)[0:19]
    return matches


# TODO test
def get_stats(db: Session, user: schemas.User):
    crossout_date = datetime.now() - timedelta(days=HISTORY_MATCH_GET_LIMIT)
    games_as_p1 = db.query(models.GameHistory).filter(
        and_(models.GameHistory.player_one_username == user.username,
             models.GameHistory.game_end_date > crossout_date)).order_by(models.GameHistory.game_end_date).all()
    games_as_p2 = db.query(models.GameHistory).filter(
        and_(models.GameHistory.player_two_username == user.username,
             models.GameHistory.game_end_date > crossout_date)).order_by(models.GameHistory.game_end_date).all()
    # if there were no games
    if not games_as_p1 and not games_as_p2:
        return schemas.Stats(
            matches=0,
            wins=0,
            draws=0,
            loses=0,
            winrate=0,
            winrate_as_p1=0,
            winrate_as_p2=0,
            drawrate=0
        )
    elif not games_as_p1:
        matches_sum = games_as_p2
    elif not games_as_p2:
        matches_sum = games_as_p1
    else:
        matches_sum = games_as_p1 + games_as_p2
    matches = list(sorted(matches_sum, key=lambda match: match.game_end_date))
    no_matches = len(matches)
    draws = list(filter(lambda match: match.result == GameResult.DRAW, matches))
    wins_as_p1 = list(
        filter(lambda match: match.result == GameResult.PLAYER_ONE_WIN and match.player_one_username == user.username,
               matches))
    wins_as_p2 = list(
        filter(lambda match: match.result == GameResult.PLAYER_TWO_WIN and match.player_two_username == user.username,
               matches))
    winrate = len(wins_as_p1 + wins_as_p2) / no_matches
    winrate_as_p1 = len(wins_as_p1) / len(games_as_p1) if games_as_p1 else 0
    winrate_as_p2 = len(wins_as_p2) / len(games_as_p2) if games_as_p2 else 0
    no_wins = len(wins_as_p1 + wins_as_p2)
    no_draws = len(draws)
    drawrate = len(draws) / no_matches
    return schemas.Stats(
        matches=no_matches,
        wins=no_wins,
        draws=no_draws,
        loses=no_matches - (no_wins + no_draws),
        winrate=round(winrate, 2),
        winrate_as_p1=round(winrate_as_p1, 2),
        winrate_as_p2=round(winrate_as_p2, 2),
        drawrate=round(drawrate, 2)
    )


def get_settings(db: Session, user: schemas.User):
    return db.query(models.UserSettings).filter(models.UserSettings.username == user.username).first()


def update_settings(settings: schemas.Settings, db: Session, user: schemas.User):
    db_settings = get_settings(db, user)
    # change settings here
    db_settings.skip_animations = settings.skip_animations
    db_settings.sound_on = settings.sound_on
    db_settings.theme = settings.theme
    # ------------------------------------------
    db.commit()
    db.refresh(db_settings)
    return db_settings


def get_chat(db: Session, game_id: str):
    db_chat = db.query(models.ChatMessegesTable).filter(models.ChatMessegesTable.game_id == game_id).first()
    return db_chat


def add_message_chat(db: Session, messaage: Message, game_id: str):
    db_chat = get_chat(db, game_id)
    messages = [json.loads(x) for x in json.loads(db_chat.messages_json)]
    chat = GameChat(db_chat.game_id, [Message(**m) for m in messages])
    chat.messages.append(messaage)
    db_chat.messages_json = json.dumps([m.toJSON() for m in chat.messages])
    db.add(db_chat)
    db.commit()
    return chat

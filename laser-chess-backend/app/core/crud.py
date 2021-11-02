import dataclasses
import json

from pydantic import EmailStr
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from . import models, schemas
from passlib.context import CryptContext

from ..game_engine.models import GameState
from ..game_engine.requests import StartGameRequest
from uuid import uuid4

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password):
    return pwd_context.hash(password)


def get_user(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == EmailStr(email)).first()


def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()


def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(username=user.username, email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_items(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Item).offset(skip).limit(limit).all()


def create_user_item(db: Session, item: schemas.ItemCreate, user_id: int):
    db_item = models.Item(**item.dict(), owner_id=user_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def create_lobby(db: Session, user: schemas.User):
    db_lobby = models.Lobby(name=f"{user.username}'s game", game_id=str(uuid4()), player_one_username=user.username)
    db.add(db_lobby)
    db.commit()
    db.refresh(db_lobby)
    return db_lobby


def get_lobbies(db: Session, skip: int = 0, limit: int = 100):
    lobbies = db.query(models.Lobby).offset(skip).limit(limit).all()
    return lobbies


def get_lobby(db: Session, lobby_id: int):
    return db.query(models.Lobby).filter(models.Lobby.id == lobby_id).first()


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
        db.delete(lobby)
        db.commit()
        return {"msg": "All players left. Lobby successfully deleted"}
    db.commit()
    db.refresh(lobby)
    return lobby


def update_lobby(db: Session, lobby: schemas.Lobby, lobby_new_data: schemas.LobbyEditData):
    lobby.name = lobby_new_data.name
    lobby.is_ranked = lobby_new_data.is_ranked
    lobby.is_private = lobby_new_data.is_private
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


def get_friend_request(id: int, db: Session):
    return db.query(models.FriendRequests).filter(models.FriendRequests.id == id).first()


def get_friend_record(user: schemas.User, friend: schemas.User, db: Session):
    return db.query(models.FriendRequests).filter(or_(and_(models.FriendRequests.user_two_username == friend.username,
                                                           models.FriendRequests.user_one_username == user.username),
                                                      and_((models.FriendRequests.user_two_username == user.username,
                                                            models.FriendRequests.user_one_username == friend.username)))).first()


def get_pending_friend_request(id: int, db: Session):
    return db.query(models.FriendRequests).filter(and_(
        models.FriendRequests.id == id, models.FriendRequests.status == schemas.FriendRequestStatus.PENDING)).first()


def get_users_pending_friend_requests(user: schemas.User, db: Session):
    return list(db.query(models.FriendRequests).filter(
        and_(models.FriendRequests.user_two_username == user.username,
             models.FriendRequests.status == schemas.FriendRequestStatus.PENDING)))


def create_friend_request(user_sending: schemas.User, user_sent_to: schemas.User, db: Session):
    request = models.FriendRequests(user_one_username=user_sending.username, user_two_username=user_sent_to.username,
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
    lobby = get_lobby(db, request.lobby_id)
    game_state_json = json.dumps(dataclasses.asdict(game_state.to_serializable()))
    db_game_state = models.GameStateTable(player_one_id=game_state.player_one_id,
                                          player_two_id=game_state.player_two_id,
                                          game_id=lobby.game_id,
                                          game_state_json=game_state_json)
    db.add(db_game_state)
    if lobby is not None:
        db.delete(lobby)
    db.commit()
    db.refresh(db_game_state)
    return db_game_state


def update_game(db: Session, game_state: GameState, game_id: str):
    game_state_json = json.dumps(dataclasses.asdict(game_state.to_serializable()))
    db_game_state = get_game_state_table(db, game_id)
    db_game_state.game_state_json = game_state_json
    db.commit()

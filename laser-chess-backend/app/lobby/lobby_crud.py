from uuid import uuid4

from sqlalchemy.orm import Session

from app.core import models
from app.user import user_schemas
from . import lobby_schemas


def create_lobby(db: Session, user: user_schemas.User):
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


def join_lobby(db: Session, user: user_schemas.User, lobby: lobby_schemas.Lobby):
    lobby.player_two_username = user.username
    db.commit()
    db.refresh(lobby)
    return lobby


def leave_lobby(db: Session, user: user_schemas.User, lobby: lobby_schemas.Lobby):
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


def update_lobby(db: Session, lobby: lobby_schemas.Lobby, lobby_new_data: lobby_schemas.LobbyEditData):
    lobby.name = lobby_new_data.name
    lobby.is_ranked = lobby_new_data.is_ranked
    lobby.is_private = lobby_new_data.is_private
    lobby.starting_position_reversed = lobby_new_data.starting_position_reversed
    db.commit()
    db.refresh(lobby)
    return lobby

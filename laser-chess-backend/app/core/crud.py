import dataclasses
import json

from sqlalchemy.orm import Session

from . import models, schemas
from passlib.context import CryptContext

from ..game_engine.models import GameState
from ..game_engine.requests import StartGameRequest

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password):
    return pwd_context.hash(password)


def get_user(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


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


def get_game_state_table(db: Session, game_id: str):
    return db.query(models.GameStateTable).filter(models.GameStateTable.game_id == game_id).first()


def start_game(db: Session, game_state: GameState, request: StartGameRequest):
    db_game_state = models.GameStateTable(player_one_id=request.player_one_id,
                                          player_two_id=request.player_two_id,
                                          game_id=request.game_id,
                                          game_state_json=json.dumps(dataclasses.asdict(game_state)))
    db.add(db_game_state)
    db.commit()
    db.refresh(db_game_state)
    return db_game_state

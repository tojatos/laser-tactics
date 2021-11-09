import dataclasses
import json

from pydantic import EmailStr
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from . import models
from passlib.context import CryptContext

from ..game_engine.models import GameState
from ..game_engine.requests import StartGameRequest
from uuid import uuid4




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

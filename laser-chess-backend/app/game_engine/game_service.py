import json
import string

from fastapi import HTTPException
from sqlalchemy.orm import Session

from .models import *
from .requests import ShootLaserRequest, GetGameStateRequest, StartGameRequest
from ..core import crud


def get_game_state(request: GetGameStateRequest, db: Session) -> GameState:
    game_state_table = crud.get_game_state_table(db, game_id=request.game_id)

    if game_state_table is None:
        raise HTTPException(status_code=404, detail=f"Game with id {request.game_id} does not exist.")

    game_state_json = game_state_table.game_state_json
    return json.loads(game_state_json)


def start_game(user_id: string, request: StartGameRequest, db: Session):
    # TODO: validate request
    initial_state = GameState(player_one_id=request.player_one_id, player_two_id=request.player_two_id)
    crud.start_game(db, initial_state, request)


def shoot_laser(user_id: string, request: ShootLaserRequest):
    print(user_id)
    print(request.game_id)

    # GET GAME STATE FROM DB
    # VALIDATE REQUEST
    # MAKE A MOVE AND SAVE NEW GAME STATE



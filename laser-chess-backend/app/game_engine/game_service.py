import json
import string

from fastapi import HTTPException
from sqlalchemy.orm import Session

from .game import Game
from .models import *
from .requests import *
from ..core import crud


def get_game_state(request: GetGameStateRequest, db: Session) -> GameStateSerializable:
    game_state_table = crud.get_game_state_table(db, game_id=request.game_id)

    if game_state_table is None:
        raise HTTPException(status_code=404, detail=f"Game with id {request.game_id} does not exist.")

    game_state_json = game_state_table.game_state_json
    game_state_dict = json.loads(game_state_json)
    g = GameStateSerializable(**game_state_dict)
    return g


def start_game(user_id: string, request: StartGameRequest, db: Session):
    # TODO: validate request
    initial_state = empty_game_state(player_one_id=request.player_one_id, player_two_id=request.player_two_id)
    crud.start_game(db, initial_state, request)


def shoot_laser(user_id: string, request: ShootLaserRequest, db: Session):
    game_state_serializable = get_game_state(GetGameStateRequest(request.game_id), db)
    game_state = game_state_serializable.to_normal()
    game = Game(game_state)
    player = Player.PLAYER_ONE if game_state.player_one_id == user_id else Player.PLAYER_TWO
    print(game.game_state.board.cells[(5, 0)])
    game.shoot_laser(player)
    print(game.game_state.board.cells[(5, 0)])
    crud.update_game(db, game.game_state, request.game_id)

    # GET GAME STATE FROM DB
    # VALIDATE REQUEST
    # MAKE A MOVE AND SAVE NEW GAME STATE


def move_piece(user_id: string, request: MovePieceRequest, db: Session):
    pass

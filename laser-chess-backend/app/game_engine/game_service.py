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
    # validation
    lobby = crud.get_lobby(db, lobby_id=request.lobby_id)
    if not lobby:
        raise HTTPException(status_code=404, detail="lobby not found, unable to start the game")
    if not lobby.starting_position_reversed:
        if lobby.player_one_username != user_id:
            raise HTTPException(status_code=403, detail="unable to start the game")
        else:
            initial_state = empty_game_state(player_one_id=lobby.player_one_username, player_two_id=lobby.player_two_username)
    else:
        if lobby.player_two_username != user_id:
            raise HTTPException(status_code=403, detail="unable to start the game")
        else:
            initial_state = empty_game_state(player_one_id=lobby.player_two_username, player_two_id=lobby.player_one_username)
    game_id = lobby.game_id
    # lobby is deleted here
    crud.start_game(db, initial_state, request)

    game = Game(initial_state)
    game.start_game()
    crud.update_game(db, game.game_state, game_id)


def get_player_from_user_id(game_state: GameState, user_id: str):
    return {
        game_state.player_one_id: Player.PLAYER_ONE,
        game_state.player_two_id: Player.PLAYER_TWO,
    }.get(user_id, None)


def shoot_laser(user_id: string, request: ShootLaserRequest, db: Session):
    game_state_serializable = get_game_state(GetGameStateRequest(request.game_id), db)
    game_state = game_state_serializable.to_normal()
    player = get_player_from_user_id(game_state, user_id)

    if player is None:
        raise HTTPException(status_code=403, detail=f"You are not a player in game with id {request.game_id}.")

    game = Game(game_state)

    can_move, error = game.validate_laser_shoot(player)
    if not can_move:
        raise HTTPException(status_code=403, detail=f"Unable to shoot laser. {error}")

    game.shoot_laser(player)
    crud.update_game(db, game.game_state, request.game_id)


def move_piece(user_id: string, request: MovePieceRequest, db: Session):
    game_state_serializable = get_game_state(GetGameStateRequest(request.game_id), db)
    game_state = game_state_serializable.to_normal()
    player = get_player_from_user_id(game_state, user_id)

    if player is None:
        raise HTTPException(status_code=403, detail=f"You are not a player in game with id {request.game_id}.")

    game = Game(game_state)

    can_move, error = game.validate_move(player, tuple(request.move_from), tuple(request.move_to))
    if not can_move:
        raise HTTPException(status_code=403, detail=f"Unable to make a move. {error}")

    game.move(tuple(request.move_from), tuple(request.move_to))
    crud.update_game(db, game.game_state, request.game_id)


def rotate_piece(user_id: string, request: RotatePieceRequest, db: Session):
    game_state_serializable = get_game_state(GetGameStateRequest(request.game_id), db)
    game_state = game_state_serializable.to_normal()
    player = get_player_from_user_id(game_state, user_id)

    if player is None:
        raise HTTPException(status_code=403, detail=f"You are not a player in game with id {request.game_id}.")

    game = Game(game_state)

    can_rotate, error = game.validate_rotation(player, tuple(request.rotate_at), request.angle)
    if not can_rotate:
        raise HTTPException(status_code=403, detail=f"Unable to rotate. {error}")

    game.rotate(tuple(request.rotate_at), request.angle)
    crud.update_game(db, game.game_state, request.game_id)

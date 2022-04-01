import json
import string

from fastapi import HTTPException
from sqlalchemy.orm import Session

from .game import Game
from .models import *
from .requests import *
from ..core.internal import crud


def get_game_state(request: GetGameStateRequest, db: Session) -> GameStateSerializable:
    # TODO: think about what the f is wrong with me, cuz this is wrong way to do that for sure
    game_state_table = crud.get_game_state_table(db, game_id=request.game_id)

    if game_state_table is None:
        raise HTTPException(status_code=404, detail=f"Game with id {request.game_id} does not exist.")

    game_state_json = game_state_table.game_state_json
    game_state_dict = json.loads(game_state_json)
    g = GameStateSerializable(**game_state_dict)
    game = Game(g.to_normal())

    if game.game_state.game_phase == GamePhase.STARTED:
        game.update_clock()
        crud.update_game(db, game.game_state, request.game_id)
        game_state_table = crud.get_game_state_table(db, game_id=request.game_id)

        if game_state_table is None:
            raise HTTPException(status_code=404, detail=f"Game with id {request.game_id} does not exist.")

        game_state_json = game_state_table.game_state_json
        game_state_dict = json.loads(game_state_json)
        g = GameStateSerializable(**game_state_dict)
    return g


def start_game(username: str, request: StartGameRequest, db: Session):
    if username != request.player_two_id and username != request.player_one_id:
        raise HTTPException(status_code=403, detail="User need to participate in Game in order to start it")
    initial_state = empty_game_state(player_one_id=request.player_one_id, player_two_id=request.player_two_id,
                                     is_rated=request.is_rated)
    crud.start_game(db, initial_state, request)

    game = Game(initial_state)
    game.start_game()
    crud.update_game(db, game.game_state, request.game_id)


def get_player_from_user_id(game_state: GameState, user_id: str):
    return {
        game_state.player_one_id: Player.PLAYER_ONE,
        game_state.player_two_id: Player.PLAYER_TWO,
    }.get(user_id, None)


def give_up(user_id: string, request: GiveUpRequest, db: Session):
    game_state_serializable = get_game_state(GetGameStateRequest(request.game_id), db)
    game_state = game_state_serializable.to_normal()
    player = get_player_from_user_id(game_state, user_id)

    if player is None:
        raise HTTPException(status_code=403, detail=f"You are not a player in game with id {request.game_id}.")

    game = Game(game_state)

    can_move, error = game.validate_timeout()
    if not can_move:
        raise HTTPException(status_code=403, detail=f"Unable to timeout. {error}")

    game.give_up(player)
    crud.update_game(db, game.game_state, request.game_id)


def timeout(user_id: string, request: TimeoutRequest, db: Session):
    game_state_serializable = get_game_state(GetGameStateRequest(request.game_id), db)
    game_state = game_state_serializable.to_normal()
    player = get_player_from_user_id(game_state, user_id)

    if player is None:
        raise HTTPException(status_code=403, detail=f"You are not a player in game with id {request.game_id}.")

    game = Game(game_state)

    can_move, error = game.validate_timeout()
    if not can_move:
        raise HTTPException(status_code=403, detail=f"Unable to timeout. {error}")

    game.timeout(request.player_nr)
    crud.update_game(db, game.game_state, request.game_id)


def offer_draw(user_id: string, request: GiveUpRequest, db: Session):
    game_state_serializable = get_game_state(GetGameStateRequest(request.game_id), db)
    game_state = game_state_serializable.to_normal()
    player = get_player_from_user_id(game_state, user_id)

    if player is None:
        raise HTTPException(status_code=403, detail=f"You are not a player in game with id {request.game_id}.")

    game = Game(game_state)

    can_move, error = game.validate_offer_draw(player)
    if not can_move:
        raise HTTPException(status_code=403, detail=f"Unable to offer draw. {error}")

    game.offer_draw(player)
    crud.update_game(db, game.game_state, request.game_id)


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

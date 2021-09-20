from app.game_engine.game import Game
from app.game_engine.models import *


def get_initial_test_game_state() -> GameState:
    player_one_id = "player1"
    player_two_id = "player2"
    return empty_game_state(player_one_id, player_two_id)


def test_start_game():
    initial_state = get_initial_test_game_state()
    game = Game(initial_state)
    assert game.game_state.is_started is False
    game.start_game()
    assert game.game_state.is_started is True


def test_move_piece():
    initial_state = get_initial_test_game_state()
    game = Game(initial_state)
    assert game.game_state.board.cells is False #TODO
    # game.move()
    # assert game.game_state.is_started is False
    # game.start_game()
    # assert game.game_state.is_started is True

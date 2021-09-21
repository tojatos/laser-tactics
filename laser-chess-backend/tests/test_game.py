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
    game.start_game()
    from_cell_coordinates = CellCoordinates((0, 1))
    to_cell_coordinates = CellCoordinates((0, 2))
    cells = game.game_state.board.cells
    piece = cells[from_cell_coordinates]
    assert piece is not None
    assert cells[to_cell_coordinates] is None
    game.move(from_cell_coordinates, to_cell_coordinates)
    cells = game.game_state.board.cells
    assert cells[from_cell_coordinates] is None
    assert cells[to_cell_coordinates] is piece

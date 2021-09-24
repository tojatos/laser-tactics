from app.game_engine.game import Game
from app.game_engine.models import *


def get_initial_test_game_state() -> GameState:
    player_one_id = "player1"
    player_two_id = "player2"
    return empty_game_state(player_one_id, player_two_id)


def get_test_game_state(board: Board) -> GameState:
    player_one_id = "player1"
    player_two_id = "player2"
    return GameState(player_one_id, player_two_id, board, False, 0)


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
    from_cell_coordinates = (0, 1)
    to_cell_coordinates = (0, 2)
    cells = game.game_state.board.cells
    piece = cells[from_cell_coordinates]
    assert piece is not None
    assert cells[to_cell_coordinates] is None
    game.move(from_cell_coordinates, to_cell_coordinates)
    cells = game.game_state.board.cells
    assert cells[from_cell_coordinates] is None
    assert cells[to_cell_coordinates] is piece


def get_shoot_laser_state(initial_board: Board) -> GameState:
    initial_state = get_test_game_state(initial_board)
    game = Game(initial_state)
    game.start_game()
    game.shoot_laser(Player.PLAYER_ONE)
    return game.game_state


def test_shoot_laser_block():
    board: Board = Board({
        (0, 0): Piece(PieceType.LASER, Player.PLAYER_ONE),
        (0, 1): Piece(PieceType.BLOCK, Player.PLAYER_TWO),
    })

    game_state = get_shoot_laser_state(board)
    cells = game_state.board.cells

    assert cells[(0, 0)] == Piece(PieceType.LASER, Player.PLAYER_ONE)
    assert cells[(0, 1)] is None


def test_shoot_laser_block_rotation_90():
    board: Board = Board({
        (0, 0): Piece(PieceType.LASER, Player.PLAYER_ONE),
        (0, 1): Piece(PieceType.BLOCK, Player.PLAYER_TWO, 90)
    })

    game_state = get_shoot_laser_state(board)
    cells = game_state.board.cells

    assert cells[(0, 0)] == Piece(PieceType.LASER, Player.PLAYER_ONE)
    assert cells[(0, 1)] is None


def test_shoot_laser_block_rotation_180():
    board: Board = Board({
        (0, 0): Piece(PieceType.LASER, Player.PLAYER_ONE),
        (0, 1): Piece(PieceType.BLOCK, Player.PLAYER_TWO, 180)
    })

    game_state = get_shoot_laser_state(board)
    cells = game_state.board.cells

    assert cells[(0, 0)] is None
    assert cells[(0, 1)] == Piece(PieceType.BLOCK, Player.PLAYER_TWO, 180)


def test_shoot_laser_block_rotation_270():
    board: Board = Board({
        (0, 0): Piece(PieceType.LASER, Player.PLAYER_ONE),
        (0, 1): Piece(PieceType.BLOCK, Player.PLAYER_TWO, 270)
    })

    game_state = get_shoot_laser_state(board)
    cells = game_state.board.cells

    assert cells[(0, 0)] == Piece(PieceType.LASER, Player.PLAYER_ONE)
    assert cells[(0, 1)] is None


def test_shoot_laser_mirror_deflect():
    board: Board = Board({
        (0, 0): Piece(PieceType.LASER, Player.PLAYER_ONE),
        (0, 1): Piece(PieceType.MIRROR, Player.PLAYER_TWO),
    })

    game_state = get_shoot_laser_state(board)
    cells = game_state.board.cells

    assert cells[(0, 0)] is None
    assert cells[(0, 1)] == Piece(PieceType.MIRROR, Player.PLAYER_TWO)


def test_shoot_laser_mirror_pass_through():
    board: Board = Board({
        (0, 0): Piece(PieceType.LASER, Player.PLAYER_ONE),
        (0, 1): Piece(PieceType.MIRROR, Player.PLAYER_TWO, 90),
    })

    game_state = get_shoot_laser_state(board)
    cells = game_state.board.cells

    assert cells[(0, 0)] == Piece(PieceType.LASER, Player.PLAYER_ONE)
    assert cells[(0, 1)] == Piece(PieceType.MIRROR, Player.PLAYER_TWO, 90)


def test_shoot_laser_beam_splitter_destroy_blocks():
    board: Board = Board({
        (1, 0): Piece(PieceType.LASER, Player.PLAYER_ONE),
        (1, 1): Piece(PieceType.BEAM_SPLITTER, Player.PLAYER_ONE),
        (0, 1): Piece(PieceType.BLOCK, Player.PLAYER_ONE),
        (2, 1): Piece(PieceType.BLOCK, Player.PLAYER_ONE),
    })

    game_state = get_shoot_laser_state(board)

    expected_board: Board = Board({
        (1, 0): Piece(PieceType.LASER, Player.PLAYER_ONE),
        (1, 1): Piece(PieceType.BEAM_SPLITTER, Player.PLAYER_ONE),
        (0, 1): None,
        (2, 1): None,
    })

    assert game_state.board == expected_board


def test_shoot_laser_beam_splitter_mirror():
    board: Board = Board({
        (1, 0): Piece(PieceType.LASER, Player.PLAYER_ONE),
        (1, 1): Piece(PieceType.BEAM_SPLITTER, Player.PLAYER_ONE),
        (0, 1): Piece(PieceType.MIRROR, Player.PLAYER_ONE, 90),
        (2, 1): Piece(PieceType.MIRROR, Player.PLAYER_ONE, 90),
    })

    game_state = get_shoot_laser_state(board)

    expected_board: Board = Board({
        (1, 0): None,
        (1, 1): Piece(PieceType.BEAM_SPLITTER, Player.PLAYER_ONE),
        (0, 1): Piece(PieceType.MIRROR, Player.PLAYER_ONE, 90),
        (2, 1): Piece(PieceType.MIRROR, Player.PLAYER_ONE, 90),
    })

    assert game_state.board == expected_board


def test_shoot_laser_beam_multiple_beam_splitters():
    board: Board = Board({
        (0, 0): None,
        (1, 0): Piece(PieceType.LASER, Player.PLAYER_ONE),
        (2, 0): None,

        (0, 1): Piece(PieceType.BEAM_SPLITTER, Player.PLAYER_ONE, 180),
        (1, 1): Piece(PieceType.BEAM_SPLITTER, Player.PLAYER_ONE, 270),
        (2, 1): Piece(PieceType.BLOCK, Player.PLAYER_ONE, 270),

        (0, 2): Piece(PieceType.BEAM_SPLITTER, Player.PLAYER_ONE, 270),
        (1, 2): Piece(PieceType.BEAM_SPLITTER, Player.PLAYER_ONE),
        (2, 2): None
    })

    game_state = get_shoot_laser_state(board)

    expected_board: Board = Board({
        (0, 0): None,
        (1, 0): None,
        (2, 0): None,

        (0, 1): Piece(PieceType.BEAM_SPLITTER, Player.PLAYER_ONE, 180),
        (1, 1): None,
        (2, 1): Piece(PieceType.BLOCK, Player.PLAYER_ONE, 270),

        (0, 2): Piece(PieceType.BEAM_SPLITTER, Player.PLAYER_ONE, 270),
        (1, 2): Piece(PieceType.BEAM_SPLITTER, Player.PLAYER_ONE),
        (2, 2): None
    })

    assert game_state.board == expected_board


def test_shoot_laser_hyper_square():
    board: Board = Board({
        (0, 0): Piece(PieceType.LASER, Player.PLAYER_ONE),
        (0, 1): Piece(PieceType.HYPER_SQUARE, Player.NONE),
        (0, 2): Piece(PieceType.BLOCK, Player.PLAYER_ONE, 180),
    })

    game_state = get_shoot_laser_state(board)

    assert game_state.board == board


def test_shoot_laser_hyper_cube():
    board: Board = Board({
        (0, 0): Piece(PieceType.LASER, Player.PLAYER_ONE),
        (0, 1): Piece(PieceType.HYPER_CUBE, Player.PLAYER_ONE),
        (0, 2): Piece(PieceType.BLOCK, Player.PLAYER_ONE, 180),
    })

    expected_board: Board = Board({
        (0, 0): None,
        (0, 1): Piece(PieceType.HYPER_CUBE, Player.PLAYER_ONE),
        (0, 2): Piece(PieceType.BLOCK, Player.PLAYER_ONE, 180),
    })

    game_state = get_shoot_laser_state(board)

    assert game_state.board == expected_board


def test_shoot_laser_king():
    board: Board = Board({
        (0, 0): Piece(PieceType.LASER, Player.PLAYER_ONE),
        (0, 1): Piece(PieceType.KING, Player.PLAYER_ONE, 180),
    })

    expected_board: Board = Board({
        (0, 0): Piece(PieceType.LASER, Player.PLAYER_ONE),
        (0, 1): None
    })

    game_state = get_shoot_laser_state(board)

    assert game_state.board == expected_board

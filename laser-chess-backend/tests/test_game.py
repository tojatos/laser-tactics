from app.game_engine.game import Game
from app.game_engine.models import *


def get_initial_test_game_state() -> GameState:
    player_one_id = "player1"
    player_two_id = "player2"
    return empty_game_state(player_one_id, player_two_id)


def get_test_game_state(board: Board) -> GameState:
    player_one_id = "player1"
    player_two_id = "player2"
    return GameState(player_one_id, player_two_id, board, False, 0, [], [])


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


def test_shoot_laser_mirror_deflect_vertical():
    board: Board = Board({
        (0, 0): Piece(PieceType.LASER, Player.PLAYER_ONE, 90),
        (1, 0): Piece(PieceType.MIRROR, Player.PLAYER_TWO, 90),
    })

    game_state = get_shoot_laser_state(board)
    cells = game_state.board.cells

    assert cells[(0, 0)] is None
    assert cells[(1, 0)] == Piece(PieceType.MIRROR, Player.PLAYER_TWO, 90)


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


def test_shoot_laser_infinite_laser_loop():
    board: Board = Board({
        (0, 0): Piece(PieceType.LASER, Player.PLAYER_ONE),
        (1, 0): None,

        (0, 1): Piece(PieceType.BEAM_SPLITTER, Player.PLAYER_ONE, 270),
        (1, 1): Piece(PieceType.BEAM_SPLITTER, Player.PLAYER_ONE, 180),

        (0, 2): Piece(PieceType.BEAM_SPLITTER, Player.PLAYER_ONE),
        (1, 2): Piece(PieceType.BEAM_SPLITTER, Player.PLAYER_ONE, 90),
    })

    game_state = get_shoot_laser_state(board)

    assert game_state.board == board


def test_shoot_laser_triangular_mirror():
    board: Board = Board({
        (0, 0): Piece(PieceType.LASER, Player.PLAYER_ONE),
        (1, 0): None,

        (0, 1): Piece(PieceType.TRIANGULAR_MIRROR, Player.PLAYER_ONE, 90),
        (1, 1): Piece(PieceType.TRIANGULAR_MIRROR, Player.PLAYER_ONE, 270),

        (0, 2): Piece(PieceType.TRIANGULAR_MIRROR, Player.PLAYER_ONE, 90),
        (1, 2): Piece(PieceType.TRIANGULAR_MIRROR, Player.PLAYER_ONE, 180),
    })

    expected_board: Board = Board({
        (0, 0): Piece(PieceType.LASER, Player.PLAYER_ONE),
        (1, 0): None,

        (0, 1): None,
        (1, 1): Piece(PieceType.TRIANGULAR_MIRROR, Player.PLAYER_ONE, 270),

        (0, 2): Piece(PieceType.TRIANGULAR_MIRROR, Player.PLAYER_ONE, 90),
        (1, 2): Piece(PieceType.TRIANGULAR_MIRROR, Player.PLAYER_ONE, 180),
    })

    game_state = get_shoot_laser_state(board)

    assert game_state.board == expected_board


def test_shoot_laser_diagonal_mirror():
    board: Board = Board({
        (0, 0): Piece(PieceType.KING, Player.PLAYER_ONE),
        (1, 0): Piece(PieceType.LASER, Player.PLAYER_ONE),
        (2, 0): None,

        (0, 1): Piece(PieceType.BEAM_SPLITTER, Player.PLAYER_ONE, 270),
        (1, 1): Piece(PieceType.DIAGONAL_MIRROR, Player.PLAYER_ONE),
        (2, 1): Piece(PieceType.DIAGONAL_MIRROR, Player.PLAYER_ONE, 180),

        (0, 2): Piece(PieceType.KING, Player.PLAYER_TWO),
        (1, 2): Piece(PieceType.DIAGONAL_MIRROR, Player.PLAYER_ONE),
        (2, 2): Piece(PieceType.DIAGONAL_MIRROR, Player.PLAYER_ONE, 90),
    })

    expected_board: Board = Board({
        (0, 0): None,
        (1, 0): Piece(PieceType.LASER, Player.PLAYER_ONE),
        (2, 0): None,

        (0, 1): Piece(PieceType.BEAM_SPLITTER, Player.PLAYER_ONE, 270),
        (1, 1): Piece(PieceType.DIAGONAL_MIRROR, Player.PLAYER_ONE),
        (2, 1): Piece(PieceType.DIAGONAL_MIRROR, Player.PLAYER_ONE, 180),

        (0, 2): None,
        (1, 2): Piece(PieceType.DIAGONAL_MIRROR, Player.PLAYER_ONE),
        (2, 2): Piece(PieceType.DIAGONAL_MIRROR, Player.PLAYER_ONE, 90),
    })

    game_state = get_shoot_laser_state(board)

    assert game_state.board == expected_board
    assert game_state.game_events == [LaserShotEvent(
        [(0, (1, 1)), (1, (2, 1)), (2, (2, 2)), (3, (1, 2)), (4, (1, 1)), (5, (0, 1)), (6, (0, 2)), (6, (0, 0))])]


def test_move_hyper_cube():
    board: Board = Board({
        (0, 0): Piece(PieceType.HYPER_CUBE, Player.PLAYER_ONE),
        (1, 0): Piece(PieceType.LASER, Player.PLAYER_TWO),
    })

    expected_board: Board = Board({
        (0, 0): Piece(PieceType.LASER, Player.PLAYER_TWO),
        (1, 0): Piece(PieceType.HYPER_CUBE, Player.PLAYER_ONE),
    })
    initial_state = get_test_game_state(board)
    game = Game(initial_state)
    game.start_game()
    from_cell_coordinates = (0, 0)
    to_cell_coordinates = (1, 0)

    game.move(from_cell_coordinates, to_cell_coordinates)

    assert game.game_state.board == expected_board


def test_move_hyper_cube_king():
    board: Board = Board({
        (0, 0): Piece(PieceType.HYPER_CUBE, Player.PLAYER_ONE),
        (1, 0): Piece(PieceType.KING, Player.PLAYER_TWO),
    })

    expected_board: Board = Board({
        (0, 0): Piece(PieceType.KING, Player.PLAYER_TWO),
        (1, 0): Piece(PieceType.HYPER_CUBE, Player.PLAYER_ONE),
    })
    initial_state = get_test_game_state(board)
    game = Game(initial_state)
    game.start_game()
    from_cell_coordinates = (0, 0)
    to_cell_coordinates = (1, 0)

    game.move(from_cell_coordinates, to_cell_coordinates)

    assert game.game_state.board == expected_board


def test_move_hyper_square():
    board: Board = Board({
        (0, 0): Piece(PieceType.BLOCK, Player.PLAYER_ONE),
        (1, 0): Piece(PieceType.HYPER_SQUARE, Player.NONE),
    })

    initial_state = get_test_game_state(board)
    game = Game(initial_state)
    game.start_game()
    from_cell_coordinates = (0, 0)
    to_cell_coordinates = (1, 0)

    game.move(from_cell_coordinates, to_cell_coordinates)

    assert game.game_state.board == board


def test_rotate_piece():
    board: Board = Board({
        (0, 0): Piece(PieceType.TRIANGULAR_MIRROR, Player.PLAYER_ONE),
    })

    initial_state = get_test_game_state(board)
    game = Game(initial_state)
    game.start_game()

    game.rotate((0, 0), 90)
    assert game.game_state.board.cells[(0, 0)].rotation_degree == 90

    game.rotate((0, 0), 90)
    assert game.game_state.board.cells[(0, 0)].rotation_degree == 180

    game.rotate((0, 0), 90)
    assert game.game_state.board.cells[(0, 0)].rotation_degree == 270

    game.rotate((0, 0), 90)
    assert game.game_state.board.cells[(0, 0)].rotation_degree == 0

    game.rotate((0, 0), 270)
    assert game.game_state.board.cells[(0, 0)].rotation_degree == 270

    game.rotate((0, 0), 180)
    assert game.game_state.board.cells[(0, 0)].rotation_degree == 90


def test_validate_shoot_laser_twice():
    board: Board = Board({
        (0, 0): Piece(PieceType.LASER, Player.PLAYER_ONE),
        (0, 1): Piece(PieceType.BLOCK, Player.PLAYER_TWO),
    })

    initial_state = get_test_game_state(board)
    game = Game(initial_state)
    game.start_game()
    assert game.validate_laser_shoot(Player.PLAYER_ONE) is True
    game.shoot_laser(Player.PLAYER_ONE)
    assert game.validate_laser_shoot(Player.PLAYER_ONE) is False


def test_validate_taking_three_actions():
    board: Board = Board({
        (0, 0): Piece(PieceType.LASER, Player.PLAYER_ONE),
        (0, 1): Piece(PieceType.BLOCK, Player.PLAYER_TWO),
    })

    initial_state = get_test_game_state(board)
    game = Game(initial_state)
    game.start_game()

    assert game.validate_rotation(Player.PLAYER_ONE, (0, 0), 90) is True
    assert game.validate_rotation(Player.PLAYER_TWO, (0, 1), 90) is False

    game.rotate((0, 0), 90)

    assert game.validate_rotation(Player.PLAYER_ONE, (0, 0), 90) is True
    assert game.validate_rotation(Player.PLAYER_TWO, (0, 1), 90) is False

    game.rotate((0, 0), 90)

    assert game.validate_rotation(Player.PLAYER_ONE, (0, 0), 90) is False
    assert game.validate_rotation(Player.PLAYER_TWO, (0, 1), 90) is True


def validate_piece_capture(piece_type: PieceType, can_capture: bool):
    board: Board = Board({
        (0, 0): Piece(piece_type, Player.PLAYER_ONE),
        (0, 1): Piece(PieceType.KING, Player.PLAYER_TWO),
    })

    initial_state = get_test_game_state(board)
    game = Game(initial_state)
    game.start_game()

    assert game.validate_move(Player.PLAYER_ONE, (0, 0), (0, 1)) is can_capture


def test_capture_beam_splitter():
    validate_piece_capture(PieceType.BEAM_SPLITTER, False)


def test_capture_block():
    validate_piece_capture(PieceType.BLOCK, True)


def test_capture_diagonal_mirror():
    validate_piece_capture(PieceType.DIAGONAL_MIRROR, False)


def test_capture_hyper_cube():
    validate_piece_capture(PieceType.HYPER_CUBE, True)


def test_capture_king():
    validate_piece_capture(PieceType.KING, True)


def test_capture_laser():
    validate_piece_capture(PieceType.LASER, False)


def test_capture_mirror():
    validate_piece_capture(PieceType.MIRROR, False)


def test_capture_king_twice():
    board: Board = Board({
        (0, 0): Piece(PieceType.KING, Player.PLAYER_ONE),
        (0, 1): Piece(PieceType.BLOCK, Player.PLAYER_TWO),
        (0, 2): Piece(PieceType.KING, Player.PLAYER_TWO),
    })

    initial_state = get_test_game_state(board)
    game = Game(initial_state)
    game.start_game()

    assert game.validate_move(Player.PLAYER_ONE, (0, 0), (0, 1)) is True
    game.move((0, 0), (0, 1))
    assert game.validate_move(Player.PLAYER_ONE, (0, 1), (0, 2)) is False


def test_capture_block_twice():
    board: Board = Board({
        (0, 0): Piece(PieceType.BLOCK, Player.PLAYER_ONE),
        (0, 1): Piece(PieceType.BLOCK, Player.PLAYER_TWO),
        (0, 2): Piece(PieceType.KING, Player.PLAYER_TWO),
    })

    initial_state = get_test_game_state(board)
    game = Game(initial_state)
    game.start_game()

    assert game.validate_move(Player.PLAYER_ONE, (0, 0), (0, 1)) is True
    game.move((0, 0), (0, 1))
    assert game.validate_move(Player.PLAYER_ONE, (0, 1), (0, 2)) is True


def test_laser_move():
    board: Board = Board({
        (0, 0): Piece(PieceType.LASER, Player.PLAYER_ONE),
        (0, 1): None,
    })

    initial_state = get_test_game_state(board)
    game = Game(initial_state)
    game.start_game()

    assert game.validate_move(Player.PLAYER_ONE, (0, 0), (0, 1)) is False


def test_capture_own_piece():
    board: Board = Board({
        (0, 0): Piece(PieceType.KING, Player.PLAYER_ONE),
        (0, 1): Piece(PieceType.BLOCK, Player.PLAYER_ONE),
    })

    initial_state = get_test_game_state(board)
    game = Game(initial_state)
    game.start_game()

    assert game.validate_move(Player.PLAYER_ONE, (0, 0), (0, 1)) is False


def test_move_on_own_turn():
    board: Board = Board({
        (0, 0): Piece(PieceType.KING, Player.PLAYER_ONE),
        (0, 1): None,
        (1, 0): Piece(PieceType.KING, Player.PLAYER_TWO),
        (1, 1): None,
    })

    initial_state = get_test_game_state(board)
    game = Game(initial_state)
    game.start_game()

    assert game.validate_move(Player.PLAYER_ONE, (0, 0), (0, 1)) is True
    assert game.validate_move(Player.PLAYER_TWO, (1, 0), (1, 1)) is False

    game.move((0, 0), (0, 1))

    assert game.validate_move(Player.PLAYER_ONE, (0, 1), (0, 0)) is True
    assert game.validate_move(Player.PLAYER_TWO, (1, 0), (1, 1)) is False

    game.move((0, 1), (0, 0))

    assert game.validate_move(Player.PLAYER_ONE, (0, 0), (0, 1)) is False
    assert game.validate_move(Player.PLAYER_TWO, (1, 0), (1, 1)) is True

    game.move((1, 0), (1, 1))

    assert game.validate_move(Player.PLAYER_ONE, (0, 0), (0, 1)) is False
    assert game.validate_move(Player.PLAYER_TWO, (1, 1), (1, 0)) is True

    game.move((1, 1), (1, 0))

    assert game.validate_move(Player.PLAYER_ONE, (0, 0), (0, 1)) is True
    assert game.validate_move(Player.PLAYER_TWO, (1, 0), (1, 1)) is False

    game.move((0, 0), (0, 1))


def test_teleport_with_hyper_cube_twice():
    board: Board = Board({
        (0, 0): Piece(PieceType.HYPER_CUBE, Player.PLAYER_ONE),
        (1, 0): Piece(PieceType.BLOCK, Player.PLAYER_ONE),
    })

    initial_state = get_test_game_state(board)
    game = Game(initial_state)
    game.start_game()

    assert game.validate_move(Player.PLAYER_ONE, (0, 0), (1, 0)) is True

    game.move((0, 0), (1, 0))

    assert game.validate_move(Player.PLAYER_ONE, (1, 0), (0, 0)) is False


def test_teleport_with_hyper_square_twice():
    board: Board = Board({
        (0, 0): Piece(PieceType.BLOCK, Player.PLAYER_ONE),
        (1, 0): Piece(PieceType.HYPER_SQUARE, Player.NONE),
        (2, 0): Piece(PieceType.BLOCK, Player.PLAYER_ONE),
    })

    initial_state = get_test_game_state(board)
    game = Game(initial_state)
    game.start_game()

    assert game.validate_move(Player.PLAYER_ONE, (0, 0), (1, 0)) is True
    assert game.validate_move(Player.PLAYER_ONE, (2, 0), (1, 0)) is True

    game.move((0, 0), (1, 0))

    assert game.validate_move(Player.PLAYER_ONE, (0, 0), (1, 0)) is False
    assert game.validate_move(Player.PLAYER_ONE, (2, 0), (1, 0)) is False


def test_take_hyper_cube():
    board: Board = Board({
        (0, 0): Piece(PieceType.BLOCK, Player.PLAYER_ONE),
        (1, 0): Piece(PieceType.HYPER_CUBE, Player.PLAYER_ONE),
        (2, 0): Piece(PieceType.BLOCK, Player.PLAYER_TWO),
    })

    initial_state = get_test_game_state(board)
    game = Game(initial_state)
    game.start_game()

    assert game.validate_move(Player.PLAYER_ONE, (0, 0), (1, 0)) is False

    game.move((1, 0), (0, 0))
    game.move((0, 0), (1, 0))

    assert game.validate_move(Player.PLAYER_TWO, (2, 0), (1, 0)) is True
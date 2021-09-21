from .models import *


class Game:
    def __init__(self, game_state: GameState):
        self.game_state = game_state

    def start_game(self):
        self.game_state.is_started = True

    def move(self, from_cell: CellCoordinates, to_cell: CellCoordinates):
        self.game_state.board.cells[to_cell] = self.game_state.board.cells[from_cell]
        self.game_state.board.cells[from_cell] = None

    def rotate(self, from_cell: CellCoordinates, to_cell: CellCoordinates):
        self.game_state.board.cells[to_cell] = self.game_state.board.cells[from_cell]
        self.game_state.board.cells[from_cell] = None

    def shoot_laser(self, player: Player):
        cells_list = self.game_state.board.to_serializable().cells
        laser_cell = next(x for x in cells_list if x.piece.piece_type == PieceType.LASER and x.piece.piece_type == player)
        laser_coordinates = laser_cell.coordinates
        # TODO: calculate laser path
        # TODO: add time to laser path? path as tuple list (time, cell)
        # TODO: if hit destroy
        # TODO: add user and game events to game state
        # TODO: laser path game event and hit game event
        # self.game_state.board.cells[to_cell] = self.game_state.board.cells[from_cell]
        # self.game_state.board.cells[from_cell] = None

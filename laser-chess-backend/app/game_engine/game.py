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

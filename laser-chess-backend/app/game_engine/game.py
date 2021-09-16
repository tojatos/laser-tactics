import string

from game_engine.models import *


class Game:
    def __init__(self, game_state: GameState):
        self.game_state = game_state

    def start_game(self, player_ids: (string, string)):
        self.game_state.player_ids = player_ids
        self.game_state.is_started = True

    def move(self, from_cell: CellCoordinates, to_cell: CellCoordinates):
        cells = self.game_state.board.cells

        cell_to = next((x for x in cells if x.coordinates == to_cell))
        cell_from = next((x for x in cells if x.coordinates == from_cell))

        cell_to.piece = cell_from.piece
        cell_from.piece = None



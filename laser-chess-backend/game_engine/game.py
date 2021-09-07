import string

from game_engine.models import GameState


class Game:
    def __init__(self, game_state: GameState):
        self.game_state = game_state

    def start_game(self, player_ids: (string, string)):
        self.game_state.player_ids = player_ids
        self.game_state.is_started = True

import string

from .models import GameState
from .requests import ShootLaserRequest, GetGameStateRequest, StartGameRequest


def get_game_state(request: GetGameStateRequest):
    print(request.game_id)


def start_game(user_id: string, request: StartGameRequest):
    print(request.game_id)
    # initial_state = GameState()


def shoot_laser(user_id: string, request: ShootLaserRequest):
    print(user_id)
    print(request.game_id)

    # GET GAME STATE FROM DB
    # VALIDATE REQUEST
    # MAKE A MOVE AND SAVE NEW GAME STATE



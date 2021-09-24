from copy import deepcopy
from queue import Queue

from .models import *


class Direction(str, Enum):
    UP = auto()
    LEFT = auto()
    DOWN = auto()
    RIGHT = auto()


rotation_from_direction = {
    Direction.UP: 0,
    Direction.RIGHT: 90,
    Direction.DOWN: 180,
    Direction.LEFT: 270,
}
direction_from_rotation = {v: k for k, v in rotation_from_direction.items()}

horizontal_directions = [Direction.RIGHT, Direction.LEFT]
vertical_directions = [Direction.UP, Direction.DOWN]


def opposite_direction(d: Direction):
    directions = horizontal_directions if d in horizontal_directions else vertical_directions
    return list(filter(lambda x: x is not d, directions))[0]


def normalize_rotation(rotation: int) -> int:
    return rotation % 360


def get_next_laser_coordinates(last_coordinates: CellCoordinates, last_laser_direction: Direction) -> CellCoordinates:
    if last_laser_direction == Direction.LEFT:
        return last_coordinates[0] - 1, last_coordinates[1]
    if last_laser_direction == Direction.UP:
        return last_coordinates[0], last_coordinates[1] + 1
    if last_laser_direction == Direction.RIGHT:
        return last_coordinates[0] + 1, last_coordinates[1]
    if last_laser_direction == Direction.DOWN:
        return last_coordinates[0], last_coordinates[1] - 1


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
        cells = self.game_state.board.cells
        cells_after_laser_hit = deepcopy(self.game_state.board.cells)
        cells_list = self.game_state.board.to_serializable().cells
        laser_cell = next(x for x in cells_list if x.piece.piece_type == PieceType.LASER and x.piece.piece_owner == player)
        laser_coordinates = tuple(laser_cell.coordinates)
        laser_rotation = laser_cell.piece.rotation_degree

        laser_path = []
        initial_laser_direction = direction_from_rotation[laser_rotation]

        laser_queue: Queue[(CellCoordinates, Direction, int)] = Queue()
        laser_queue.put((laser_coordinates, initial_laser_direction, 0))

        while not laser_queue.empty():
            last_coordinates, last_laser_direction, time = laser_queue.get()

            current_coordinates = get_next_laser_coordinates(last_coordinates, last_laser_direction)

            if current_coordinates not in cells:
                continue

            laser_path += (time, current_coordinates)

            if current_coordinates in cells:
                piece_hit = cells[current_coordinates]
                if piece_hit is None:
                    laser_queue.put((current_coordinates, last_laser_direction, time + 1))
                else:
                    piece_facing_direction = direction_from_rotation[piece_hit.rotation_degree]

                    if piece_hit.piece_type is PieceType.MIRROR:
                        x = {last_laser_direction, piece_facing_direction}
                        should_deflect = x.issubset(horizontal_directions) or x.issubset(vertical_directions)
                        if should_deflect:
                            next_laser_direction = opposite_direction(piece_facing_direction)
                            laser_queue.put((current_coordinates, next_laser_direction, time + 1))
                        else:
                            laser_queue.put((current_coordinates, last_laser_direction, time + 1))
                    if piece_hit.piece_type is PieceType.LASER:
                        cells_after_laser_hit[current_coordinates] = None
                    if piece_hit.piece_type is PieceType.BLOCK:
                        should_deflect = last_laser_direction == opposite_direction(piece_facing_direction)
                        if should_deflect:
                            next_laser_direction = opposite_direction(last_laser_direction)
                            laser_queue.put((current_coordinates, next_laser_direction, time + 1))
                        else:
                            cells_after_laser_hit[current_coordinates] = None

        self.game_state.board.cells = cells_after_laser_hit

        # TODO: add user and game events to game state
        # TODO: laser path game event and hit game event

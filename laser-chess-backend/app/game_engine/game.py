from copy import deepcopy
from queue import Queue
import random

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
        if self.game_state.board.cells[from_cell].piece_type == PieceType.HYPER_CUBE:
            target_piece = self.game_state.board.cells[to_cell]
            self.game_state.board.cells[to_cell] = self.game_state.board.cells[from_cell]
            self.game_state.board.cells[from_cell] = None
            if target_piece is not None:
                random_empty_cell_coordinates_list = random.choice(list(filter(lambda x: x.piece is None, self.game_state.board.to_serializable().cells))).coordinates
                random_empty_cell_coordinates: Tuple[int, int] = tuple(random_empty_cell_coordinates_list)
                self.game_state.board.cells[random_empty_cell_coordinates] = target_piece
                self.game_state.game_events.append(TeleportEvent(from_cell, random_empty_cell_coordinates))
        else:
            self.game_state.board.cells[to_cell] = self.game_state.board.cells[from_cell]
            self.game_state.board.cells[from_cell] = None
        self.game_state.game_events.append(PieceMovedEvent(from_cell, to_cell))

    def rotate(self, rotated_piece_at: CellCoordinates, rotation: int):
        self.game_state.board.cells[rotated_piece_at].rotation_degree = normalize_rotation(self.game_state.board.cells[rotated_piece_at].rotation_degree + rotation)
        self.game_state.game_events.append(PieceRotatedEvent(rotated_piece_at, rotation))

    def shoot_laser(self, player: Player):
        cells = self.game_state.board.cells
        cells_after_laser_hit = deepcopy(self.game_state.board.cells)
        cells_list = self.game_state.board.to_serializable().cells
        laser_cell = next(x for x in cells_list if x.piece is not None and x.piece.piece_type == PieceType.LASER and x.piece.piece_owner == player)
        laser_coordinates = tuple(laser_cell.coordinates)
        laser_rotation = laser_cell.piece.rotation_degree

        laser_path = []
        initial_laser_direction = direction_from_rotation[laser_rotation]

        laser_queue: Queue[(CellCoordinates, Direction, int)] = Queue()
        laser_queue.put((laser_coordinates, initial_laser_direction, 0))

        while not laser_queue.empty():
            last_coordinates, last_laser_direction, time = laser_queue.get()

            # TODO: detect loops and exit on loop instead
            if time > 300:
                break

            current_coordinates = get_next_laser_coordinates(last_coordinates, last_laser_direction)

            if current_coordinates not in cells:
                continue

            laser_path.append((time, current_coordinates))

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
                    if piece_hit.piece_type is PieceType.BEAM_SPLITTER:
                        should_deflect_in_both_sides = last_laser_direction == piece_facing_direction
                        should_deflect_right = last_laser_direction == direction_from_rotation[normalize_rotation(piece_hit.rotation_degree + 90)]
                        should_deflect_left = last_laser_direction == direction_from_rotation[normalize_rotation(piece_hit.rotation_degree + 270)]
                        if should_deflect_in_both_sides:
                            next_laser_directions = horizontal_directions if last_laser_direction in vertical_directions else vertical_directions
                            for d in next_laser_directions:
                                laser_queue.put((current_coordinates, d, time + 1))
                        elif should_deflect_right:
                            next_laser_direction = direction_from_rotation[normalize_rotation(rotation_from_direction[last_laser_direction] + 90)]
                            laser_queue.put((current_coordinates, next_laser_direction, time + 1))
                        elif should_deflect_left:
                            next_laser_direction = direction_from_rotation[normalize_rotation(rotation_from_direction[last_laser_direction] + 270)]
                            laser_queue.put((current_coordinates, next_laser_direction, time + 1))
                        else:
                            cells_after_laser_hit[current_coordinates] = None
                    if piece_hit.piece_type is PieceType.HYPER_SQUARE:
                        pass
                    if piece_hit.piece_type is PieceType.HYPER_CUBE:
                        laser_queue.put((current_coordinates, last_laser_direction, time + 1))
                    if piece_hit.piece_type is PieceType.KING:
                        cells_after_laser_hit[current_coordinates] = None
                    if piece_hit.piece_type is PieceType.TRIANGULAR_MIRROR:
                        should_deflect_right = last_laser_direction == direction_from_rotation[normalize_rotation(piece_hit.rotation_degree + 270)]
                        should_deflect_left = last_laser_direction == direction_from_rotation[normalize_rotation(piece_hit.rotation_degree + 180)]
                        if should_deflect_right:
                            next_laser_direction = direction_from_rotation[normalize_rotation(rotation_from_direction[last_laser_direction] + 90)]
                            laser_queue.put((current_coordinates, next_laser_direction, time + 1))
                        elif should_deflect_left:
                            next_laser_direction = direction_from_rotation[normalize_rotation(rotation_from_direction[last_laser_direction] + 270)]
                            laser_queue.put((current_coordinates, next_laser_direction, time + 1))
                        else:
                            cells_after_laser_hit[current_coordinates] = None
                    if piece_hit.piece_type is PieceType.DIAGONAL_MIRROR:
                        should_deflect_right = last_laser_direction in [piece_facing_direction, opposite_direction(piece_facing_direction)]
                        next_laser_direction = direction_from_rotation[normalize_rotation(rotation_from_direction[last_laser_direction] + (90 if should_deflect_right else 270))]
                        laser_queue.put((current_coordinates, next_laser_direction, time + 1))

        print(laser_path)
        self.game_state.board.cells = cells_after_laser_hit
        self.game_state.game_events.append(LaserShotEvent(laser_path))

        # TODO: add user and game events to game state
        # TODO: laser path game event and hit game event

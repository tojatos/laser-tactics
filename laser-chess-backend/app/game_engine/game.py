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

    def is_game_started(self):
        return self.game_state.game_phase is not GamePhase.NOT_STARTED

    def is_game_over(self):
        return self.game_state.game_phase in [GamePhase.DRAW, GamePhase.PLAYER_ONE_VICTORY,
                                              GamePhase.PLAYER_TWO_VICTORY]

    def check_victory(self):
        is_p1_king_alive = len([c for c in self.game_state.board.cells.values()
                                if c is not None
                                and c.piece_owner is Player.PLAYER_ONE
                                and c.piece_type is PieceType.KING]) == 1
        is_p2_king_alive = len([c for c in self.game_state.board.cells.values()
                                if c is not None
                                and c.piece_owner is Player.PLAYER_TWO
                                and c.piece_type is PieceType.KING]) == 1
        if not is_p1_king_alive and not is_p2_king_alive:
            self.game_state.game_phase = GamePhase.DRAW
        elif not is_p1_king_alive:
            self.game_state.game_phase = GamePhase.PLAYER_TWO_VICTORY
        elif not is_p2_king_alive:
            self.game_state.game_phase = GamePhase.PLAYER_ONE_VICTORY

    def get_last_turn_player(self):
        return Player.PLAYER_ONE if (self.game_state.turn_number + 3) % 4 in [1, 2] else Player.PLAYER_TWO

    def get_current_player(self):
        return Player.PLAYER_ONE if self.game_state.turn_number % 4 in [1, 2] else Player.PLAYER_TWO

    def give_up(self, player):
        event = GiveUpEvent(player)
        self.game_state.user_events.append(event)
        self.game_state.game_events.append(event)
        self.game_state.game_phase = GamePhase.PLAYER_ONE_VICTORY if player is Player.PLAYER_TWO \
            else GamePhase.PLAYER_TWO_VICTORY

    def timeout(self, player_nr):
        if not self.game_state.is_timed: raise AssertionError("game is not timed")
        event = TimeoutEvent(player_nr)
        self.game_state.user_events.append(event)
        self.game_state.game_events.append(event)
        self.game_state.game_phase = GamePhase.PLAYER_ONE_VICTORY if player_nr == 2 \
            else GamePhase.PLAYER_TWO_VICTORY

    def offer_draw(self, player):
        game_draw_offers: List[OfferDrawEvent] = [e for e in self.game_state.user_events if
                                                  isinstance(e, OfferDrawEvent)]

        event = OfferDrawEvent(player, self.game_state.turn_number)
        self.game_state.user_events.append(event)
        self.game_state.game_events.append(event)

        if game_draw_offers:
            last_draw_offer = game_draw_offers[-1]
            if last_draw_offer.player != player and self.game_state.turn_number - last_draw_offer.turn_number < 3:
                self.game_state.game_phase = GamePhase.DRAW

    def update_clock(self):
        if self.game_state.is_timed:
            player = self.get_current_player()
            now = datetime.now()
            timediff = int((now - self.game_state.last_clock_update).total_seconds())
            if player is Player.PLAYER_ONE:
                self.game_state.player_one_time_left = self.game_state.player_one_time_left - timediff
                if self.game_state.player_one_time_left < 0:
                    self.game_state.player_one_time_left = 0
                    self.timeout(1)
            else:
                self.game_state.player_two_time_left = self.game_state.player_two_time_left - timediff
                if self.game_state.player_two_time_left < 0:
                    self.game_state.player_two_time_left = 0
                    self.timeout(2)
            self.game_state.last_clock_update = now

    def start_game(self):
        self.game_state.game_phase = GamePhase.STARTED
        self.game_state.turn_number = 1
        self.game_state.game_start_timestamp = datetime.now()

    def move(self, from_cell: CellCoordinates, to_cell: CellCoordinates):
        self.game_state.user_events.append(PieceMovedEvent(from_cell, to_cell))
        moved_piece = self.game_state.board.cells[from_cell]
        target_piece = self.game_state.board.cells[to_cell]

        if target_piece is not None \
                and target_piece.piece_type == PieceType.HYPER_SQUARE:
            self.game_state.board.cells[from_cell] = None

            random_empty_cell_coordinates_list = random.choice(
                list(filter(lambda x: x.piece is None, self.game_state.board.to_serializable().cells))).coordinates
            random_empty_cell_coordinates: Tuple[int, int] = tuple(random_empty_cell_coordinates_list)

            self.game_state.board.cells[random_empty_cell_coordinates] = moved_piece
            self.game_state.game_events.append(PieceMovedEvent(from_cell, to_cell))
            self.game_state.game_events.append(TeleportEvent(to_cell, random_empty_cell_coordinates, target_piece))

        elif moved_piece.piece_type == PieceType.HYPER_CUBE:
            self.game_state.board.cells[to_cell] = moved_piece
            self.game_state.board.cells[from_cell] = None
            self.game_state.game_events.append(PieceMovedEvent(from_cell, to_cell))
            if target_piece is not None:
                random_empty_cell_coordinates_list = random.choice(
                    list(filter(lambda x: x.piece is None, self.game_state.board.to_serializable().cells))).coordinates
                random_empty_cell_coordinates: Tuple[int, int] = tuple(random_empty_cell_coordinates_list)
                self.game_state.board.cells[random_empty_cell_coordinates] = target_piece
                self.game_state.game_events.append(TeleportEvent(to_cell, random_empty_cell_coordinates, moved_piece))
        else:
            self.game_state.board.cells[to_cell] = moved_piece
            self.game_state.board.cells[from_cell] = None
            self.game_state.game_events.append(PieceMovedEvent(from_cell, to_cell))
            if target_piece is not None:
                self.game_state.game_events.append(
                    PieceTakenEvent(to_cell, moved_piece.piece_type, target_piece.piece_type))
        self.update_clock()
        self.game_state.turn_number += 1
        self.check_victory()

    def rotate(self, rotated_piece_at: CellCoordinates, rotation: int):
        self.game_state.user_events.append(PieceRotatedEvent(rotated_piece_at, rotation))
        self.game_state.board.cells[rotated_piece_at].rotation_degree = normalize_rotation(
            self.game_state.board.cells[rotated_piece_at].rotation_degree + rotation)
        self.game_state.game_events.append(PieceRotatedEvent(rotated_piece_at, rotation))
        self.update_clock()
        self.game_state.turn_number += 1

    def shoot_laser(self, player: Player):
        self.game_state.user_events.append(ShootLaserEvent())
        cells = self.game_state.board.cells
        cells_after_laser_hit = deepcopy(self.game_state.board.cells)
        cells_list = self.game_state.board.to_serializable().cells
        laser_cell = next(x for x in cells_list if
                          x.piece is not None and x.piece.piece_type == PieceType.LASER and x.piece.piece_owner == player)
        laser_coordinates = tuple(laser_cell.coordinates)
        laser_rotation = laser_cell.piece.rotation_degree

        laser_path = []
        pieces_destroyed_by_laser_events = []
        initial_laser_direction = direction_from_rotation[laser_rotation]

        laser_path.append((0, laser_coordinates))

        laser_queue: Queue[(CellCoordinates, Direction, int)] = Queue()
        laser_queue.put((laser_coordinates, initial_laser_direction, 1))

        while not laser_queue.empty():
            last_coordinates, last_laser_direction, time = laser_queue.get()

            # TODO: detect loops and exit on loop instead
            if time > 300:
                break

            current_coordinates = get_next_laser_coordinates(last_coordinates, last_laser_direction)

            laser_path.append((time, current_coordinates))

            if current_coordinates not in cells:
                continue

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
                            next_laser_direction = opposite_direction(last_laser_direction)
                            laser_queue.put((current_coordinates, next_laser_direction, time + 1))
                        else:
                            laser_queue.put((current_coordinates, last_laser_direction, time + 1))
                    if piece_hit.piece_type is PieceType.LASER:
                        cells_after_laser_hit[current_coordinates] = None
                        pieces_destroyed_by_laser_events.append(
                            PieceDestroyedEvent(current_coordinates, piece_hit, time))
                    if piece_hit.piece_type is PieceType.BLOCK:
                        should_deflect = last_laser_direction == opposite_direction(piece_facing_direction)
                        if should_deflect:
                            next_laser_direction = opposite_direction(last_laser_direction)
                            laser_queue.put((current_coordinates, next_laser_direction, time + 1))
                        else:
                            cells_after_laser_hit[current_coordinates] = None
                            pieces_destroyed_by_laser_events.append(
                                PieceDestroyedEvent(current_coordinates, piece_hit, time))
                    if piece_hit.piece_type is PieceType.BEAM_SPLITTER:
                        should_deflect_in_both_sides = last_laser_direction == piece_facing_direction
                        should_deflect_right = last_laser_direction == direction_from_rotation[
                            normalize_rotation(piece_hit.rotation_degree + 90)]
                        should_deflect_left = last_laser_direction == direction_from_rotation[
                            normalize_rotation(piece_hit.rotation_degree + 270)]
                        if should_deflect_in_both_sides:
                            next_laser_directions = horizontal_directions if last_laser_direction in vertical_directions else vertical_directions
                            for d in next_laser_directions:
                                laser_queue.put((current_coordinates, d, time + 1))
                        elif should_deflect_right:
                            next_laser_direction = direction_from_rotation[
                                normalize_rotation(rotation_from_direction[last_laser_direction] + 90)]
                            laser_queue.put((current_coordinates, next_laser_direction, time + 1))
                        elif should_deflect_left:
                            next_laser_direction = direction_from_rotation[
                                normalize_rotation(rotation_from_direction[last_laser_direction] + 270)]
                            laser_queue.put((current_coordinates, next_laser_direction, time + 1))
                        else:
                            cells_after_laser_hit[current_coordinates] = None
                            pieces_destroyed_by_laser_events.append(
                                PieceDestroyedEvent(current_coordinates, piece_hit, time))
                    if piece_hit.piece_type is PieceType.HYPER_SQUARE:
                        pass
                    if piece_hit.piece_type is PieceType.HYPER_CUBE:
                        laser_queue.put((current_coordinates, last_laser_direction, time + 1))
                    if piece_hit.piece_type is PieceType.KING:
                        cells_after_laser_hit[current_coordinates] = None
                        pieces_destroyed_by_laser_events.append(
                            PieceDestroyedEvent(current_coordinates, piece_hit, time))
                    if piece_hit.piece_type is PieceType.TRIANGULAR_MIRROR:
                        should_deflect_right = last_laser_direction == direction_from_rotation[
                            normalize_rotation(piece_hit.rotation_degree + 270)]
                        should_deflect_left = last_laser_direction == direction_from_rotation[
                            normalize_rotation(piece_hit.rotation_degree + 180)]
                        if should_deflect_right:
                            next_laser_direction = direction_from_rotation[
                                normalize_rotation(rotation_from_direction[last_laser_direction] + 90)]
                            laser_queue.put((current_coordinates, next_laser_direction, time + 1))
                        elif should_deflect_left:
                            next_laser_direction = direction_from_rotation[
                                normalize_rotation(rotation_from_direction[last_laser_direction] + 270)]
                            laser_queue.put((current_coordinates, next_laser_direction, time + 1))
                        else:
                            cells_after_laser_hit[current_coordinates] = None
                            pieces_destroyed_by_laser_events.append(
                                PieceDestroyedEvent(current_coordinates, piece_hit, time))
                    if piece_hit.piece_type is PieceType.DIAGONAL_MIRROR:
                        should_deflect_right = last_laser_direction in [piece_facing_direction,
                                                                        opposite_direction(piece_facing_direction)]
                        next_laser_direction = direction_from_rotation[normalize_rotation(
                            rotation_from_direction[last_laser_direction] + (90 if should_deflect_right else 270))]
                        laser_queue.put((current_coordinates, next_laser_direction, time + 1))

        self.game_state.board.cells = cells_after_laser_hit
        self.game_state.game_events.append(LaserShotEvent(laser_path))
        self.game_state.game_events.extend(pieces_destroyed_by_laser_events)
        self.update_clock()
        self.game_state.turn_number += 1
        self.check_victory()

    def validate_move(self, player: Player, from_cell: CellCoordinates, to_cell: CellCoordinates) -> Tuple[bool, Optional[str]]:
        if not self.is_game_started():
            return False, "The game has not started yet."

        if self.is_game_over():
            return False, "The game is over."

        moved_piece = self.game_state.board.cells[from_cell]
        target_piece = self.game_state.board.cells[to_cell]
        last_game_event = self.game_state.game_events[-1] if self.game_state.game_events else None

        if self.get_current_player() is not player:
            return False, "This is not your turn."
        if moved_piece is None:
            return False, "There is no piece to move."
        if moved_piece.piece_type is PieceType.LASER:
            return False, "You cannot move laser pieces."
        if moved_piece.piece_owner != player:
            return False, "This is not your piece."
        if {abs(from_cell[0] - to_cell[0]), abs(from_cell[1] - to_cell[1])} != {0, 1}:
            return False, "Target cell is too far away from piece, or you are trying to move to the same cell you started from."
        if target_piece is not None:
            if target_piece.piece_type is PieceType.HYPER_SQUARE:
                if self.get_last_turn_player() is player and isinstance(last_game_event, TeleportEvent):
                    if last_game_event.teleported_by == target_piece:
                        return False, "You can use hyper square only once per turn."
                return True, None
            if moved_piece.piece_type is PieceType.HYPER_CUBE:
                if self.get_last_turn_player() is player and isinstance(last_game_event, TeleportEvent):
                    if last_game_event.teleported_by == moved_piece:
                        return False, "You can use hypercube only once per turn."
                return True, None
            if target_piece.piece_owner == player:
                return False, "You cannot take your own pieces."
            if moved_piece.piece_type not in [PieceType.KING, PieceType.BLOCK]:
                return False, "Only blocks and kings can take pieces."
            if self.get_last_turn_player() is player and isinstance(last_game_event, PieceTakenEvent):
                if moved_piece.piece_type == last_game_event.piece_that_took_type == PieceType.KING:
                    return False, "King can take only once per turn."
        return True, None

    def validate_give_up(self):
        if not self.is_game_started():
            return False, "The game has not started yet."

        if self.is_game_over():
            return False, "The game is over."
        return True, None

    def validate_timeout(self):

        if not self.game_state.player_one_time_left > 0 and self.game_state.player_two_time_left > 0:
            return False, "Players time has not run out yet"

        if not self.is_game_started():
            return False, "The game has not started yet."

        if self.is_game_over():
            return False, "The game is over."
        return True, None

    def validate_offer_draw(self, player):
        if not self.is_game_started():
            return False, "The game has not started yet."

        if self.is_game_over():
            return False, "The game is over."

        game_draw_offers: List[OfferDrawEvent] = [e for e in self.game_state.user_events if
                                                  isinstance(e, OfferDrawEvent)]
        this_player_draw_offers = [e for e in game_draw_offers if e.player is player]

        if not this_player_draw_offers:
            return True, ""

        if self.game_state.turn_number - this_player_draw_offers[-1].turn_number > 3:
            return True, ""

        return False, "You cannot make another draw offer so soon."

    def validate_rotation(self, player: Player, rotated_piece_at: CellCoordinates, rotation: int)-> Tuple[bool, Optional[str]]:
        if not self.is_game_started():
            return False, "The game has not started yet."

        if self.is_game_over():
            return False, "The game is over."

        if self.get_current_player() is not player:
            return False, "This is not your turn."

        allowed_rotations = [90, 180, 270]
        if rotation not in allowed_rotations:
            return False, f"You can only rotate in degrees: {allowed_rotations}."

        piece = self.game_state.board.cells[rotated_piece_at]
        if piece is None:
            return False, "There is no piece to rotate."
        if piece.piece_owner != player:
            return False, "You cannot rotate other player's pieces."
        return True, None

    def validate_laser_shoot(self, player: Player) -> Tuple[bool, Optional[str]]:
        if not self.is_game_started():
            return False, "The game has not started yet."

        if self.is_game_over():
            return False, "The game is over."

        if self.get_current_player() is not player:
            return False, "This is not your turn."

        if self.get_last_turn_player() is player and self.game_state.user_events[-1] == ShootLaserEvent():
            return False, "You can shoot only once per turn."

        return True, None

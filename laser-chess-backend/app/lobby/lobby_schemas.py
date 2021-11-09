from enum import Enum, auto
from typing import List, Optional

from pydantic import BaseModel, validator, validate_email, EmailStr


class AutoNameEnum(Enum):
    def _generate_next_value_(self, start, count, last_values):
        return self


class LobbyEditData(BaseModel):
    id: int
    game_id: str
    name: str
    player_one_username: str
    is_ranked: bool
    is_private: bool
    starting_position_reversed: bool


class Lobby(BaseModel):
    id: int
    game_id: str
    name: str
    player_one_username: str
    player_two_username: Optional[str] = None
    is_ranked: bool = False
    is_private: bool = False
    starting_position_reversed: bool = False

    class Config:
        orm_mode = True


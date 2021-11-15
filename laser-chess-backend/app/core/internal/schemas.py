from enum import Enum, auto
from typing import List, Optional

from pydantic import BaseModel, validator, EmailStr
import datetime as dt


class AutoNameEnum(Enum):
    def _generate_next_value_(self, start, count, last_values):
        return self


class FriendRequestStatus(AutoNameEnum):
    PENDING = auto()
    ACCEPTED = auto()
    REJECTED = auto()


class LobbyStatus(AutoNameEnum):
    CREATED = auto()
    ABANDONED = auto()
    GAME_STARTED = auto()
    GAME_ENDED = auto()


class GameResult(AutoNameEnum):
    PLAYER_ONE_WIN = auto()
    PLAYER_TWO_WIN = auto()
    DRAW = auto()


class ChangePasswordSchema(BaseModel):
    oldPassword: str
    newPassword: str


class EmergencyChangePasswordSchema(BaseModel):
    token: str
    newPassword: str


class UserBase(BaseModel):
    username: str
    email: EmailStr

    @validator('username')
    def username_not_empty(cls, value):
        if not value:
            raise ValueError('Username cannot be empty')
        return value


class UserCreate(UserBase):
    password: str

    @validator('password')
    def password_not_empty(cls, value):
        if not value:
            raise ValueError('Password cannot be empty')
        return value


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None
    purpose: Optional[str] = None


class VerificationTokenData(BaseModel):
    email: Optional[str] = None
    purpose: Optional[str] = None


class User(UserBase):
    is_active: bool
    is_verified: bool

    rating: int

    class Config:
        orm_mode = True


class UserRating(BaseModel):
    username: str
    rating: int
    rating_deviation: float
    rating_volatility: float


class GameHistoryEntry(BaseModel):
    player_one_username: str
    player_one_rating: int
    player_one_deviation: float
    player_two_username: str
    player_two_rating: int
    player_two_deviation: float
    result: GameResult
    game_end_date: dt.datetime
    is_rated: bool


class LobbyEditData(BaseModel):
    game_id: str
    name: str
    player_one_username: str
    is_ranked: bool
    is_private: bool
    starting_position_reversed: bool


class Lobby(BaseModel):
    game_id: str
    name: str
    player_one_username: Optional[str] = None
    player_two_username: Optional[str] = None
    is_ranked: bool = False
    is_private: bool = False
    starting_position_reversed: bool = False
    lobby_status: LobbyStatus

    class Config:
        orm_mode = True


class FriendRequestCreate(BaseModel):
    user_two_username: str


class FriendRequest(FriendRequestCreate):
    id: str
    user_one_username: str
    status: FriendRequestStatus


class BlockedUsers(BaseModel):
    id: int
    user: str
    blocked_user: str


class Username(BaseModel):
    username: str


class LobbyId(BaseModel):
    game_id: str


class FriendRequestId(BaseModel):
    id: str

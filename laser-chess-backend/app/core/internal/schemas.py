import datetime as dt
from enum import Enum, auto
from typing import Optional

from pydantic import BaseModel, validator, EmailStr


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

    @validator('username')
    def username_longer_than_3(cls, value):
        if len(value) < 3:
            raise ValueError('Username must be at least 3 characters')
        return value

    @validator('username')
    def username_shorter_than_20(cls, value):
        if len(value) > 20:
            raise ValueError('Username can be max 20 characters')
        return value

    @validator('username')
    def username_alphanumeric(cls, v):
        assert v.isalnum(), 'must be alphanumeric'
        return v


class UserCreate(UserBase):
    password: str

    @validator('password')
    def password_not_empty(cls, value):
        if not value:
            raise ValueError('Password cannot be empty')
        return value

    @validator('password')
    def password_longer_than_3(cls, value):
        if len(value) < 3:
            raise ValueError('Password must be at least 3 characters')
        return value

    @validator('password')
    def password_shorter_than_20(cls, value):
        if len(value) > 20:
            raise ValueError('Password can be max 20 characters')
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
    registration_date: dt.date
    rating: int

    class Config:
        orm_mode = True


class UserGet(BaseModel):
    username: str
    rating: int
    registration_date: dt.date

    class Config:
        orm_mode = True


class UserRating(BaseModel):
    username: str
    rating: int
    rating_deviation: float
    rating_volatility: float


class GameHistoryEntry(BaseModel):
    game_id: str
    player_one_username: str
    player_one_rating: int
    player_one_deviation: float
    player_one_volatility: float
    player_two_username: str
    player_two_rating: int
    player_two_deviation: float
    player_two_volatility: float
    result: GameResult
    game_end_date: dt.datetime
    is_rated: bool
    player_one_new_rating: Optional[int]
    player_two_new_rating: Optional[int]

    class Config:
        orm_mode = True


class LobbyEditData(BaseModel):
    game_id: str
    name: str
    player_one_username: str
    is_ranked: bool
    is_private: bool
    starting_position_reversed: bool

    @validator('name')
    def name_not_empty(cls, value):
        if not value:
            raise ValueError('Name cannot be empty')
        return value

    @validator('name')
    def name_longer_than_3(cls, value):
        if len(value) < 3:
            raise ValueError('Name must be at least 3 characters')
        return value

    @validator('name')
    def name_shorter_than_40(cls, value):
        if len(value) > 40:
            raise ValueError('Name can be max 20 characters')
        return value


class Lobby(BaseModel):
    game_id: str
    name: str
    player_one_username: Optional[str] = None
    player_two_username: Optional[str] = None
    is_ranked: bool = False
    is_private: bool = False
    starting_position_reversed: bool = False
    lobby_status: LobbyStatus
    lobby_creation_date: dt.datetime

    class Config:
        orm_mode = True

    @validator('name')
    def name_not_empty(cls, value):
        if not value:
            raise ValueError('Name cannot be empty')
        return value

    @validator('name')
    def name_longer_than_3(cls, value):
        if len(value) < 3:
            raise ValueError('Name must be at least 3 characters')
        return value

    @validator('name')
    def name_shorter_than_40(cls, value):
        if len(value) > 40:
            raise ValueError('Name can be max 20 characters')
        return value


class FriendRequestCreate(BaseModel):
    user_two_username: str


class FriendRequest(FriendRequestCreate):
    id: str
    user_one_username: str
    status: FriendRequestStatus


class BlockedUsers(BaseModel):
    user: str
    blocked_user: str


class Username(BaseModel):
    username: str


class EmailSchema(BaseModel):
    email: EmailStr


class LobbyId(BaseModel):
    game_id: str


class FriendRequestId(BaseModel):
    id: str


class Stats(BaseModel):
    matches: int
    wins: int
    draws: int
    loses: int
    winrate: float
    winrate_as_p1: float
    winrate_as_p2: float
    drawrate: float


class Settings(BaseModel):
    skip_animations: bool = False

    class Config:
        orm_mode = True


class JoinRandomRequest(BaseModel):
    rating_lower_bound: int
    rating_higher_bound: int
    is_rated: bool


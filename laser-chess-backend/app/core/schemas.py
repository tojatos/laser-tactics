from enum import Enum, auto
from typing import List, Optional

from pydantic import BaseModel, validator, validate_email, EmailStr


class AutoNameEnum(Enum):
    def _generate_next_value_(self, start, count, last_values):
        return self


class FriendRequestStatus(AutoNameEnum):
    PENDING = auto()
    ACCEPTED = auto()
    REJECTED = auto()


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


class VerificationTokenData(BaseModel):
    email: Optional[str] = None


class User(UserBase):
    id: int
    is_active: bool
    is_verified: bool

    class Config:
        orm_mode = True


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


class FriendRequestCreate(BaseModel):
    user_two_username: str


class FriendRequest(FriendRequestCreate):
    id: int
    user_one_username: str
    status: FriendRequestStatus


class BlockedUsers(BaseModel):
    id: int
    user: str
    blocked_user: str

from enum import Enum
from typing import List, Optional

from pydantic import BaseModel


class FriendRequestStatus(Enum):
    PENDING = 0
    ACCEPTED = 1
    REJECTED = 2


class ItemBase(BaseModel):
    title: str

    description: Optional[str] = None


class ItemCreate(ItemBase):
    pass


class Item(ItemBase):
    id: int
    owner_id: int

    class Config:
        orm_mode = True


class UserBase(BaseModel):
    username: str
    email: str


class UserCreate(UserBase):
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class User(UserBase):
    id: int
    is_active: bool
    items: List[Item] = []

    class Config:
        orm_mode = True


class Lobby(BaseModel):
    id: int
    game_id: str
    name: str
    player_one_username: str
    player_two_username: Optional[str] = None
    is_ranked: bool = False
    is_private: bool = False

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

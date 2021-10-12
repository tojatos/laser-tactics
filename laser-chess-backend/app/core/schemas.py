from typing import List, Optional

from pydantic import BaseModel


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
    name: str
    player_one_id: int
    player_one_username: str
    player_two_id: int
    player_two_username: str
    game_id: int
    is_ranked: bool
    is_private: bool

    class Config:
        orm_mode = True




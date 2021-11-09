from typing import Optional

from pydantic import BaseModel, validator, EmailStr


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


class User(UserBase):
    id: int
    is_active: bool

    class Config:
        orm_mode = True

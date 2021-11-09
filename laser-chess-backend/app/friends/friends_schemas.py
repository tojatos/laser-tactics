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

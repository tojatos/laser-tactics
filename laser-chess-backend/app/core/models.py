from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, PrimaryKeyConstraint, Enum, Time
from sqlalchemy.orm import relationship

from .database import Base
from .schemas import FriendRequestStatus


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    registration_date = Column(Time)
    is_verified = Column(Boolean, default=False)
    verification_date = Column(Time)


class GameStateTable(Base):
    __tablename__ = "game_state"

    id = Column(Integer, primary_key=True, index=True)
    player_one_id = Column(String)
    player_two_id = Column(String)
    game_id = Column(String)
    game_state_json = Column(String)


class Lobby(Base):
    __tablename__ = "lobby"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    player_one_username = Column(String, nullable=True)
    player_two_username = Column(String, nullable=True)
    game_id = Column(String)
    is_ranked = Column(Boolean, default=False)
    is_private = Column(Boolean, default=False)
    starting_position_reversed = Column(Boolean, default=False)


class FriendRequests(Base):
    __tablename__ = "friend_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_one_username = Column(String)
    user_two_username = Column(String)
    status = Column(Enum(FriendRequestStatus))


class BlockedUsers(Base):
    __tablename__ = "blocked_users"

    id = Column(Integer, primary_key=True, index=True)
    user = Column(String)
    blocked_user = Column(String)

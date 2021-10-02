from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, PrimaryKeyConstraint
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

    items = relationship("Item", back_populates="owner")


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="items")


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
    player_one_id = Column(Integer)
    player_two_id = Column(Integer)
    game_id = Column(String)
    current_member_number = Column(Integer)
    max_members = Column(Integer, default=8)
    is_private = Column(Boolean, default=False)


class LobbySpectators(Base):
    __tablename__ = "lobby_spectators"

    lobby_id = Column(Integer)
    spectator_username = Column(Integer)
    __table_args__ = (
        PrimaryKeyConstraint(lobby_id, spectator_username),
        {},
    )


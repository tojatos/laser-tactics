import os
from datetime import datetime, timedelta
import asyncio
import collections
from typing import Set

from fastapi import Depends, HTTPException
from fastapi import status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from starlette.websockets import WebSocket

from app.core.internal import schemas, crud
from app.core.internal.database import SessionLocal
from app.game_engine.models import *
from app.game_engine.requests import *


def get_env(key, fallback):
    try:
        return os.environ[key]
    except KeyError:
        return fallback


SECRET_KEY = get_env('SECRET_KEY', "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
ALGORITHM = get_env('ALGORITHM', "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = get_env('ACCESS_TOKEN_EXPIRE_MINUTES', 10080)
VERIFY_TOKEN_EXPIRE_MINUTES = get_env('VERIFY_TOKEN_EXPIRE_MINUTES', 60 * 24)
CHANGE_PASSWORD_TOKEN_EXPIRE_MINUTES = get_env('VERIFY_TOKEN_EXPIRE_MINUTES', 20)
API_PREFIX = get_env('API_PREFIX', "/api/v1")
HOST = get_env('HOST', "localhost")
PORT = get_env('PORT', 8000)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ROOT_PATH = get_env('ROOT_PATH', "")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{ROOT_PATH}{API_PREFIX}/token")
VERIFY_MAIL_FROM = get_env('VERIFY_MAIL_FROM', "verification@lasertactics.online")
VERIFY_MAIL_USERNAME = get_env('VERIFY_MAIL_USERNAME', "verification@lasertactics.online")
VERIFY_MAIL_PASSWORD = get_env("VERIFY_MAIL_PASSWORD", "Verify123!@#")
VERIFY_MAIL_PORT = get_env('VERIFY_MAIL_PORT', 587)
VERIFY_MAIL_SERVER = get_env('VERIFY_MAIL_SERVER', "smtppro.zoho.eu")
VERIFICATION_URL = get_env('VERIFY_MAIL_URL', f"{ROOT_PATH}/verify/")
MAIL_FROM = get_env('MAIL_FROM', "lasertactics@lasertactics.online")
MAIL_USERNAME = get_env('MAIL_USERNAME', "lasertactics@lasertactics.online")
MAIL_PASSWORD = get_env('MAIL_PASSWORD', "r_B?KE@MU3nFnyG")
MAIL_PORT = get_env('MAIL_PORT', 587)
MAIL_SERVER = get_env('MAIL_SERVER', "smtppro.zoho.eu")
CHANGE_PASSWORD_URL = get_env('VERIFY_MAIL_URL', f"{ROOT_PATH}/change_password/")


class TokenPurpose(str, AutoNameEnum):
    LOGIN = auto()
    CHANGE_PASSWORD = auto()
    ACCOUNT_VERIFICATION = auto()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def generate_verification_token(email: str):
    token_expires = timedelta(minutes=VERIFY_TOKEN_EXPIRE_MINUTES)

    token = create_access_token(

        data={"sub": email, "purpose": TokenPurpose.ACCOUNT_VERIFICATION}, expires_delta=token_expires

    )
    return token


def generate_change_password_token(username: str):
    token_expires = timedelta(minutes=CHANGE_PASSWORD_TOKEN_EXPIRE_MINUTES)

    token = create_access_token(

        data={"sub": username, "purpose": TokenPurpose.CHANGE_PASSWORD}, expires_delta=token_expires

    )
    return token


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def authenticate_user(username: str, password: str, db: Session = Depends(get_db)):
    user = crud.get_user(db, username=username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        purpose: str = payload.get("purpose")
        if purpose != TokenPurpose.LOGIN:
            raise credentials_exception
        token_data = schemas.TokenData(username=username, purpose=purpose)
    except JWTError:
        raise credentials_exception
    user = crud.get_user(db, token_data.username)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(current_user: schemas.User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    # deactivated for now for ease of testing
    # TODO turn on when ready
    # if not current_user.is_verified:
    #    raise HTTPException(status_code=400, detail="User not verified")
    return current_user


class ConnectionManager:
    def __init__(self):
        # key: game_id value: list of user_ids
        self.game_observers: Dict[str, Set[WebSocket]] = collections.defaultdict(set)

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        print('Websocked connected:', websocket.client)

    def observe(self, game_id: str, websocket: WebSocket):
        self.game_observers[game_id].add(websocket)

    def disconnect(self, websocket: WebSocket):
        for key in self.game_observers.keys():
            self.game_observers[key].discard(websocket)

    async def notify(self, game_id: str, data: any):
        if game_id not in self.game_observers:
            return

        coroutines = [websocket.send_json(data) for websocket in self.game_observers[game_id]]
        await asyncio.gather(*coroutines)


manager = ConnectionManager()
lobby_manager = ConnectionManager()

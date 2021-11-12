import asyncio
import collections
import dataclasses
import os
from datetime import datetime, timedelta
from typing import Set

import uvicorn
from fastapi import status, APIRouter
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi_mail import MessageSchema, FastMail
from jose import JWTError, jwt
from passlib.context import CryptContext

from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse
from starlette.websockets import WebSocket, WebSocketDisconnect

from app.core import schemas
from app.core import crud, models
from app.core.database import SessionLocal, engine
from app.core.email import EmailSchema, verification_template, conf, change_password_template
from app.game_engine import game_service
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
VERIFICATION_URL = "<verification_url>/"
CHANGE_PASSWORD_URL = "<change_password_url>/"
API_PREFIX = get_env('API_PREFIX', "/api/v1")
HOST = get_env('HOST', "localhost")
PORT = get_env('PORT', 8000)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{API_PREFIX}/token")

app = FastAPI(openapi_url=f"{API_PREFIX}/openapi.json")

origins = [
    "http://localhost",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter(
    prefix=API_PREFIX,
    responses={404: {"description": "Not found"}},
)


class TokenPurpose(str,AutoNameEnum):
    LOGIN = auto()
    CHANGE_PASSWORD = auto()
    ACCOUNT_VERIFICATION = auto()


# Dependency
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


@router.post("/send_verification_email/{username}")
async def send_verification_email(username: str, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, username=username)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    if db_user.is_verified:
        raise HTTPException(status_code=400, detail="User already verified")

    token = generate_verification_token(db_user.email)
    verification_url = VERIFICATION_URL + token
    email = EmailSchema(email=[db_user.email])
    message = MessageSchema(
        subject="Verify your LaserTactics account",
        recipients=email.dict().get("email"),
        body=verification_template(username=username, verification_url=verification_url),
        subtype="html"
    )

    fm = FastMail(conf)
    await fm.send_message(message)
    return {'detail': "Verification email sent"}


@router.post("/send_password_change_request/{username}")
async def send_password_change_email(username: str, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, username=username)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    token = generate_change_password_token(username)
    url = CHANGE_PASSWORD_URL + token
    email = EmailSchema(email=[db_user.email])
    message = MessageSchema(
        subject="Your LaserTactics account password change",
        recipients=email.dict().get("email"),
        body=change_password_template(username=username, url=url),
        subtype="html"
    )

    fm = FastMail(conf)
    await fm.send_message(message)
    return {'detail': "Verification email sent"}


@router.post("/users/verify/{token}")
def verify_user(token: str, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        purpose = payload.get("purpose")
        if email is None or purpose != TokenPurpose.ACCOUNT_VERIFICATION:
            raise HTTPException(status_code=400, detail="The verification link is invalid or has expired.")
        token_data = schemas.VerificationTokenData(email=email, purpose=purpose)
    except JWTError:
        raise HTTPException(status_code=400, detail="The verification link is invalid or has expired.")
    user = crud.get_user_by_email(db, token_data.email)
    if user is None:
        raise HTTPException(status_code=400, detail="The verification link is invalid or has expired.")
    if user.is_verified:
        raise HTTPException(status_code=200, detail='Account already confirmed. Please login.')
    else:
        crud.verify_user(user=user, db=db)
    return {"detail": "Account verified successfully"}



@router.post("/users/change_password/")
def change_password(change_password_schema: schemas.EmergencyChangePasswordSchema, db: Session = Depends(get_db)):
    try:
        token = change_password_schema.token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        purpose = payload.get("purpose")
        if username is None or purpose != TokenPurpose.CHANGE_PASSWORD:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
        token_data = schemas.TokenData(username=username, purpose=purpose)
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
    user = crud.get_user(db, token_data.username)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
    return crud.change_password(user, change_password_schema.newPassword, db)


@router.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    db_user_1 = crud.get_user(db, username=user.username)
    if db_user_1:
        raise HTTPException(status_code=400, detail="This name is taken")
    return crud.create_user(db=db, user=user)


@router.get("/users/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users


@router.get("/users/{username}", response_model=schemas.User)
def read_user(username: str, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, username=username)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


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
    #if not current_user.is_verified:
    #    raise HTTPException(status_code=400, detail="User not verified")
    return current_user


@router.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(form_data.username, form_data.password, db)

    if not user:
        raise HTTPException(

            status_code=status.HTTP_401_UNAUTHORIZED,

            detail="Incorrect username or password",

            headers={"WWW-Authenticate": "Bearer"},

        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    access_token = create_access_token(

        data={"sub": user.username, "purpose": TokenPurpose.LOGIN}, expires_delta=access_token_expires

    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/users/me/", response_model=schemas.User)
async def read_users_me(current_user: schemas.User = Depends(get_current_active_user)):
    return current_user


@router.post("/users/me/change_password")
def change_password(change_password_schema: schemas.ChangePasswordSchema,
                    current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_user = crud.get_user(db=db, username=current_user.username)
    if not verify_password(change_password_schema.oldPassword, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid old password")
    return crud.change_password(user=current_user, new_password=change_password_schema.newPassword, db=db)


@router.post(GameApiRequestPath.GetGameState, response_model=GameStateSerializable,
             responses={
                 404: {"detail": "Game with id {game_id} does not exist."}
             })
async def get_game_state(request: GetGameStateRequest, db: Session = Depends(get_db)):
    game_state = game_service.get_game_state(request, db)
    return game_state


@router.post(GameApiRequestPath.StartGame)
async def start_game(request: StartGameRequest,
                     current_user: schemas.User = Depends(get_current_active_user),
                     db: Session = Depends(get_db)):
    game_service.start_game(current_user.username, request, db)


@router.post(GameApiRequestPath.MovePiece)
async def move_piece(request: MovePieceRequest,
                     current_user: schemas.User = Depends(get_current_active_user),
                     db: Session = Depends(get_db)):
    game_service.move_piece(current_user.username, request, db)


@router.post(GameApiRequestPath.RotatePiece)
async def move_piece(request: RotatePieceRequest,
                     current_user: schemas.User = Depends(get_current_active_user),
                     db: Session = Depends(get_db)):
    game_service.rotate_piece(current_user.username, request, db)


@router.post(GameApiRequestPath.ShootLaser)
async def shoot_laser(request: ShootLaserRequest,
                      current_user: schemas.User = Depends(get_current_active_user),
                      db: Session = Depends(get_db)):
    game_service.shoot_laser(current_user.username, request, db)


@router.get("/lobby")
async def get_lobbies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    lobbies = crud.get_lobbies(db, skip=skip, limit=limit)
    return lobbies


@router.get("/lobby/{lobby_id}", response_model=schemas.Lobby)
async def get_lobby(lobby_id,
                    db: Session = Depends(get_db)):
    db_lobby = crud.get_lobby(db, lobby_id)
    if db_lobby is None:
        raise HTTPException(status_code=404, detail="No lobby with such id")
    return db_lobby


@router.post("/lobby/create", response_model=schemas.Lobby, status_code=status.HTTP_201_CREATED)
async def create_lobby(current_user: schemas.User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    return crud.create_lobby(db=db, user=current_user)


@router.patch("/lobby/join")
async def join_lobby(lobby_id: int, current_user: schemas.User = Depends(get_current_active_user),
                     db: Session = Depends(get_db)):
    lobby = crud.get_lobby(db, lobby_id)
    if lobby is None:
        raise HTTPException(status_code=404, detail="No lobby with such id")
    if lobby.player_one_username == current_user.username or lobby.player_two_username == current_user.username:
        raise HTTPException(status_code=403, detail="cannot join own lobby")
    if lobby.player_one_username and lobby.player_two_username:
        raise HTTPException(status_code=403, detail="lobby already is full")
    return crud.join_lobby(db=db, user=current_user, lobby=lobby)


@router.patch("/lobby/leave")
async def leave_lobby(lobby_id: int, current_user: schemas.User = Depends(get_current_active_user),
                      db: Session = Depends(get_db)):
    lobby = crud.get_lobby(db, lobby_id)
    if lobby is None:
        raise HTTPException(status_code=404, detail="No lobby with such id")
    if lobby.player_one_username != current_user.username and lobby.player_two_username != current_user.username:
        raise HTTPException(status_code=403, detail="user already not in the lobby")
    lobby = crud.leave_lobby(db=db, user=current_user, lobby=lobby)
    return lobby


@router.patch("/lobby/update")
async def update_lobby(lobby: schemas.LobbyEditData, current_user: schemas.User = Depends(get_current_active_user),
                       db: Session = Depends(get_db)):
    db_lobby = crud.get_lobby(db, lobby.id)
    if db_lobby is None:
        raise HTTPException(status_code=404, detail="No lobby with such id")
    if db_lobby.game_id != lobby.game_id:
        raise HTTPException(status_code=404, detail="Game id does not match")
    if db_lobby.player_one_username != current_user.username:
        raise HTTPException(status_code=403, detail="only player 1 of the game can change game settings")
    lobby = crud.update_lobby(db=db, lobby=db_lobby, lobby_new_data=lobby)
    return lobby


@router.get("/users/me/friends")
async def get_users_friends(current_user: schemas.User = Depends(get_current_active_user),
                            db: Session = Depends(get_db)):
    return crud.get_users_friends(user=current_user, db=db)


# TODO: think about: refactor response>
@router.get("/users/me/friends/requests")
async def get_pending_requests(current_user: schemas.User = Depends(get_current_active_user),
                               db: Session = Depends(get_db)):
    return crud.get_users_pending_friend_requests(user=current_user, db=db)


@router.post("/users/me/friends/requests/send", status_code=status.HTTP_201_CREATED)
async def send_friend_request(friend_username: str, current_user: schemas.User = Depends(get_current_active_user),
                              db: Session = Depends(get_db)):
    if friend_username == current_user.username:
        raise HTTPException(status_code=404, detail="Cannot send request to yourself")
    friend_to_be = crud.get_user(username=friend_username, db=db)
    if friend_to_be is None:
        raise HTTPException(status_code=404, detail="User not found")
    friends = crud.get_users_friends(current_user, db)
    if friend_username in friends:
        raise HTTPException(status_code=403, detail="User already in friends")
    pending = filter(lambda d: d.user_one_username, crud.get_users_pending_friend_requests(user=current_user, db=db))
    if current_user.username in pending:
        raise HTTPException(status_code=403, detail="There already is pending friend request for that user")
    blocked = crud.get_blocked_users(user=friend_to_be, db=db)
    # ???? do this better?
    if current_user.username in blocked:
        raise HTTPException(status_code=403, detail="That user has blocked this user")
    return crud.create_friend_request(user_sending=current_user, user_sent_to=friend_to_be, db=db)


@router.post("/users/me/friends/requests/accept")
async def accept_friend_request(request_id: int, current_user: schemas.User = Depends(get_current_active_user),
                                db: Session = Depends(get_db)):
    request = crud.get_pending_friend_request(id=request_id, db=db)
    if request is None:
        raise HTTPException(status_code=404, detail="No pending friend request with such id")
    if request.user_two_username != current_user.username:
        raise HTTPException(status_code=401, detail="Cannot accept non-own friend request")
    return crud.accept_friend_request(friend_request=request, db=db)


@router.post("/users/me/friends/requests/decline")
async def decline_friend_request(request_id: int, current_user: schemas.User = Depends(get_current_active_user),
                                 db: Session = Depends(get_db)):
    request = crud.get_pending_friend_request(id=request_id, db=db)
    if request is None:
        raise HTTPException(status_code=404, detail="No pending friend request with such id")
    if request.user_two_username != current_user.username:
        raise HTTPException(status_code=401, detail="Cannot decline non-own friend request")
    return crud.decline_friend_request(friend_request=request, db=db)


@router.delete("/users/me/friends/unfriend")
async def remove_friend(friend_username: str, current_user: schemas.User = Depends(get_current_active_user),
                        db: Session = Depends(get_db)):
    friend = crud.get_user(db=db, username=friend_username)
    if friend is None:
        raise HTTPException(status_code=404, detail="User does not exists")
    friends = crud.get_users_friends(current_user, db)
    if friends is None or friend_username not in friends:
        raise HTTPException(status_code=404, detail="User not in friends")
    return crud.delete_friend_record(user=current_user, friend=friend, db=db)


@router.get("/users/me/blocked")
async def get_users_blocked(current_user: schemas.User = Depends(get_current_active_user),
                            db: Session = Depends(get_db)):
    return crud.get_blocked_users(user=current_user, db=db)


@router.post("/users/{username}/block")
async def block_user(username, current_user: schemas.User = Depends(get_current_active_user),
                     db: Session = Depends(get_db)):
    user_to_block = crud.get_user(username=username, db=db)
    if not user_to_block:
        raise HTTPException(status_code=404, detail="User not found")
    return crud.create_block_record(user=current_user, user_to_block=user_to_block, db=db)


@router.delete("/users/{username}/unblock")
async def unblock_user(username, current_user: schemas.User = Depends(get_current_active_user),
                       db: Session = Depends(get_db)):
    user_to_unblock = crud.get_user(username=username, db=db)
    blocked = crud.get_blocked_users(user=current_user, db=db)
    if not user_to_unblock:
        raise HTTPException(status_code=404, detail="User not found")
    if user_to_unblock.username not in blocked:
        raise HTTPException(status_code=404, detail="User not blocked")
    return crud.remove_block_record(user=current_user, blocked_user=user_to_unblock, db=db)


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


# noinspection PyTypeChecker
async def websocket_endpoint(websocket: WebSocket,
                             db: Session = Depends(get_db)
                             ):
    async def send_websocket_response(status_code: int):
        await websocket.send_json(dataclasses.asdict(WebsocketResponse(status_code)))

    current_user: schemas.User = None
    await manager.connect(websocket)
    try:
        while True:
            websocket_request_dict = await websocket.receive_json()
            websocket_request: WebsocketRequest = WebsocketRequest(**websocket_request_dict)
            if websocket_request.request_path is GameApiRequestPath.WebsocketAuth:
                request: WebsocketAuthRequest = websocket_request.request
                token = request.token
                try:
                    current_user = await get_current_user(token, db)
                    await send_websocket_response(200)
                except HTTPException:
                    await send_websocket_response(401)
            elif websocket_request.request_path is GameApiRequestPath.WebsocketObserve:
                manager.observe(websocket_request.request.game_id, websocket)
                await send_websocket_response(200)
            elif websocket_request.request_path is GameApiRequestPath.GetGameState:
                game_state = game_service.get_game_state(websocket_request.request, db)
                await websocket.send_json(dataclasses.asdict(game_state))
            elif websocket_request.request_path in [GameApiRequestPath.ShootLaser, GameApiRequestPath.MovePiece, GameApiRequestPath.RotatePiece]:
                if current_user is None:
                    await send_websocket_response(401)
                else:
                    try:
                        if websocket_request.request_path is GameApiRequestPath.ShootLaser:
                            game_service.shoot_laser(current_user.username, websocket_request.request, db)
                        if websocket_request.request_path is GameApiRequestPath.MovePiece:
                            game_service.move_piece(current_user.username, websocket_request.request, db)
                        if websocket_request.request_path is GameApiRequestPath.RotatePiece:
                            game_service.rotate_piece(current_user.username, websocket_request.request, db)
                        game_state = game_service.get_game_state(websocket_request.request, db)
                        await send_websocket_response(200)
                        await manager.notify(websocket_request.request.game_id, dataclasses.asdict(game_state))
                    except HTTPException as e:
                        await send_websocket_response(e.status_code)
            else:
                await send_websocket_response(404)
    except WebSocketDisconnect:
        print('Websocked disconnected:', websocket.client)
        manager.disconnect(websocket)
        pass


app.include_router(router)
app.add_api_websocket_route("/ws", websocket_endpoint)

if __name__ == "__main__":
    # models.Base.metadata.drop_all(bind=engine)
    models.Base.metadata.create_all(bind=engine)
    uvicorn.run(app, host=HOST, port=PORT)

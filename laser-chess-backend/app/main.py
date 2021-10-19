import os
from datetime import datetime, timedelta

import uvicorn
from fastapi import status, APIRouter
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from passlib.context import CryptContext

from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

from app.core import schemas
from app.core import crud, models
from app.core.database import SessionLocal, engine
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


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


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


@router.post("/users/{user_id}/items/", response_model=schemas.Item)
def create_item_for_user(user_id: int, item: schemas.ItemCreate, db: Session = Depends(get_db)):
    return crud.create_user_item(db=db, item=item, user_id=user_id)


@router.get("/items/", response_model=List[schemas.Item])
def read_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    items = crud.get_items(db, skip=skip, limit=limit)
    return items


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
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = crud.get_user(db, token_data.username)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(current_user: schemas.User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
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

        data={"sub": user.username}, expires_delta=access_token_expires

    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/users/me/", response_model=schemas.User)
async def read_users_me(current_user: schemas.User = Depends(get_current_active_user)):
    return current_user


# TODO idk something with this
@router.get("/users/me/items/")
async def read_own_items(current_user: schemas.User = Depends(get_current_active_user)):
    return [{"item_id": "Foo", "owner": current_user.username}]


@router.post("/get_game_state", response_model=GameStateSerializable, responses={
    404: {"detail": "Game with id {game_id} does not exist."}
})
async def get_game_state(request: GetGameStateRequest, db: Session = Depends(get_db)):
    game_state = game_service.get_game_state(request, db)
    return game_state


@router.post("/start_game")
async def start_game(request: StartGameRequest,
                     current_user: schemas.User = Depends(get_current_active_user),
                     db: Session = Depends(get_db)):
    game_service.start_game(current_user.username, request, db)


@router.post("/move_piece")
async def move_piece(request: MovePieceRequest,
                     current_user: schemas.User = Depends(get_current_active_user),
                     db: Session = Depends(get_db)):
    game_service.move_piece(current_user.username, request, db)


@router.post("/rotate_piece")
async def move_piece(request: RotatePieceRequest,
                     current_user: schemas.User = Depends(get_current_active_user),
                     db: Session = Depends(get_db)):
    game_service.rotate_piece(current_user.username, request, db)


@router.post("/shoot_laser")
async def shoot_laser(request: ShootLaserRequest,
                      current_user: schemas.User = Depends(get_current_active_user),
                      db: Session = Depends(get_db)):
    game_service.shoot_laser(current_user.username, request, db)


@router.get("/lobby")
async def get_lobbies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    lobbies = crud.get_lobbies(db, skip=skip, limit=limit)
    return lobbies


@router.get("/lobby/{id}")
async def get_lobby(lobby_id,
                    db: Session = Depends(get_db)):
    db_lobby = crud.get_lobby(db, lobby_id)
    if db_lobby is None:
        raise HTTPException(status_code=404, detail="No lobby with such id")
    return db_lobby


@router.post("/lobby/create", response_model=schemas.Lobby)
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


app.include_router(router)


if __name__ == "__main__":
    # models.Base.metadata.drop_all(bind=engine)
    models.Base.metadata.create_all(bind=engine)
    uvicorn.run(app, host=HOST, port=PORT)

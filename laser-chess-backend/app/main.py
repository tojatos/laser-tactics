from datetime import timedelta

import uvicorn
from fastapi import APIRouter, Depends, HTTPException
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from starlette import status

from app.core.dependecies import API_PREFIX, HOST, PORT, get_db, authenticate_user, ACCESS_TOKEN_EXPIRE_MINUTES, \
    create_access_token, TokenPurpose, ROOT_PATH
from app.core.internal import models, schemas
from app.core.internal.database import engine, SessionLocal
from app.core.routers import friends, users, email, game, lobby
from app.core.routers.chat import chat_websocket_endpoint
from app.core.routers.game import websocket_endpoint
from sqlalchemy.orm import Session
from fastapi_utils.tasks import repeat_every
from app.core.internal.crud import dispose_abandoned_lobby
from app.core.routers.lobby import lobby_websocket_endpoint
from starlette.middleware.sessions import SessionMiddleware

app = FastAPI(root_path=ROOT_PATH, openapi_url=f"{API_PREFIX}/openapi.json")

origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:2346",
    "https://lasertactics.online",
    "https://www.lasertactics.online",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(SessionMiddleware, secret_key="secret")

router = APIRouter(
    prefix=API_PREFIX,

    responses={404: {"description": "Not found"}},
)


# every 3 hours
@app.on_event("startup")
@repeat_every(seconds=3 * 60 * 60)
async def clear_abandoned_lobbies():
    with SessionLocal() as db:
        dispose_abandoned_lobby(db)


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


app.include_router(router)
app.include_router(users.router, prefix=API_PREFIX)
app.include_router(email.router, prefix=API_PREFIX)
app.include_router(friends.router, prefix=API_PREFIX)
app.include_router(lobby.router, prefix=API_PREFIX)
app.include_router(game.router, prefix=API_PREFIX)
app.add_api_websocket_route("/ws", websocket_endpoint)
app.add_api_websocket_route("/lobby_ws", lobby_websocket_endpoint)
app.add_api_websocket_route("/chat", chat_websocket_endpoint)

if __name__ == "__main__":
    # models.Base.metadata.drop_all(bind=engine)
    models.Base.metadata.create_all(bind=engine)
    uvicorn.run(app, host=HOST, port=PORT)

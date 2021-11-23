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
from app.core.internal.database import engine
from app.core.routers import friends, users, email, game, lobby
from app.core.routers.game import websocket_endpoint
from sqlalchemy.orm import Session

app = FastAPI(root_path=ROOT_PATH, openapi_url=f"{API_PREFIX}/openapi.json")

origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:2346",
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
app.include_router(game.router, prefix=API_PREFIX)
app.include_router(lobby.router, prefix=API_PREFIX)
app.add_api_websocket_route("/ws", websocket_endpoint)

if __name__ == "__main__":
    # models.Base.metadata.drop_all(bind=engine)
    models.Base.metadata.create_all(bind=engine)
    uvicorn.run(app, host=HOST, port=PORT)

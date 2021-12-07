import dataclasses
from fastapi import APIRouter, Depends, HTTPException
from fastapi import status
from fastapi.encoders import jsonable_encoder
from pydantic.dataclasses import dataclass
from sqlalchemy.orm import Session
from starlette.websockets import WebSocket, WebSocketDisconnect

from app.core.dependecies import get_db, get_current_active_user, lobby_manager
from app.core.internal import schemas, crud
from app.game_engine import game_service
from app.game_engine.requests import GameApiRequestPath, StartGameRequest

router = APIRouter(
    prefix="/lobby",
    tags=["lobby"],
    responses={404: {"error": "Not found"}, 422: {"error": "Invalid input data"}},
)





@router.get("")
async def get_lobbies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    lobbies = crud.get_created_lobbies(db, skip=skip, limit=limit)
    return lobbies


@router.get("/{game_id}", response_model=schemas.Lobby)
async def get_lobby(game_id: str,
                    db: Session = Depends(get_db)):
    db_lobby = crud.get_lobby(db, game_id)
    if db_lobby is None:
        raise HTTPException(status_code=404, detail="No lobby with such id")
    return db_lobby


@router.post("/create", response_model=schemas.Lobby, status_code=status.HTTP_201_CREATED)
async def create_lobby(current_user: schemas.User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    lobbys = crud.get_user_in_created_lobbies(db=db, user=current_user)
    if len(lobbys) > 0:
        raise HTTPException(status_code=403, detail="This user already is in a lobby")
    return crud.create_lobby(db=db, user=current_user)


@router.patch("/join", response_model=schemas.Lobby)
async def join_lobby(lobbyId: schemas.LobbyId, current_user: schemas.User = Depends(get_current_active_user),
                     db: Session = Depends(get_db)):
    lobbys = crud.get_user_in_created_lobbies(db=db, user=current_user)
    if len(lobbys) > 0:
        raise HTTPException(status_code=403, detail="This user already is in a lobby")
    lobby_id = lobbyId.game_id
    lobby = crud.get_lobby(db, lobby_id)
    if lobby is None:
        raise HTTPException(status_code=404, detail="No lobby with such id")
    if lobby.player_one_username == current_user.username or lobby.player_two_username == current_user.username:
        raise HTTPException(status_code=403, detail="cannot join own lobby")
    if lobby.player_one_username and lobby.player_two_username:
        raise HTTPException(status_code=403, detail="lobby already is full")

    return_value = crud.join_lobby(db=db, user=current_user, lobby=lobby)
    await lobby_manager.notify(lobby.game_id, jsonable_encoder(return_value))
    return return_value


@router.patch("/leave", response_model=schemas.Lobby)
async def leave_lobby(lobbyId: schemas.LobbyId, current_user: schemas.User = Depends(get_current_active_user),
                      db: Session = Depends(get_db)):
    lobby_id = lobbyId.game_id
    lobby = crud.get_lobby(db, lobby_id)
    if lobby is None:
        raise HTTPException(status_code=404, detail="No lobby with such id")
    if lobby.player_one_username != current_user.username and lobby.player_two_username != current_user.username:
        raise HTTPException(status_code=403, detail="user already not in the lobby")
    lobby = crud.leave_lobby(db=db, user=current_user, lobby=lobby)
    await lobby_manager.notify(lobby.game_id, jsonable_encoder(lobby))
    return lobby


@router.patch("/update", response_model=schemas.Lobby)
async def update_lobby(lobby: schemas.LobbyEditData, current_user: schemas.User = Depends(get_current_active_user),
                       db: Session = Depends(get_db)):
    db_lobby = crud.get_lobby(db, lobby.game_id)
    if db_lobby is None:
        raise HTTPException(status_code=404, detail="No lobby with such id")
    if db_lobby.game_id != lobby.game_id:
        raise HTTPException(status_code=404, detail="Game id does not match")
    if db_lobby.player_one_username != current_user.username:
        raise HTTPException(status_code=403, detail="only player 1 of the game can change game settings")
    lobby = crud.update_lobby(db=db, lobby=db_lobby, lobby_new_data=lobby)
    await lobby_manager.notify(lobby.game_id, jsonable_encoder(lobby))
    return lobby


@router.post("/join_random", response_model=schemas.Lobby)
async def join_random(joinrandom: schemas.JoinRandomRequest,
                      current_user: schemas.User = Depends(get_current_active_user),
                      db: Session = Depends(get_db)):
    lobbys = crud.get_user_in_created_lobbies(db=db, user=current_user)
    if len(lobbys) > 0:
        raise HTTPException(status_code=403, detail="This user already is in a lobby")
    lobby = crud.get_random_lobby(joinrandom, db)
    if lobby is None:
        raise HTTPException(status_code=404, detail="No lobby with such parameters found")
    return crud.join_lobby(db, current_user, lobby)


@router.post(GameApiRequestPath.StartGame)
async def start_game(request: StartGameRequest,
                     current_user: schemas.User = Depends(get_current_active_user),
                     db: Session = Depends(get_db)):
    game_service.start_game(current_user.username, request, db)
    await lobby_manager.notify(request.game_id, jsonable_encoder(crud.get_lobby(db, request.game_id)))


@dataclass
class WebsocketObserveRequest:
    game_id: str


@dataclass
class WebsocketRequest:
    request: WebsocketObserveRequest


@dataclass
class WebsocketResponse:
    status_code: int
    body: str = ""


# noinspection PyTypeChecker
async def lobby_websocket_endpoint(websocket: WebSocket):
    async def send_websocket_response(status_code: int, body: str = ""):
        await websocket.send_json(dataclasses.asdict(WebsocketResponse(status_code, body)))

    await lobby_manager.connect(websocket)
    try:
        while True:
            websocket_request_dict = await websocket.receive_json()
            websocket_request: WebsocketRequest = WebsocketRequest(**websocket_request_dict)
            lobby_manager.observe(websocket_request.request.game_id, websocket)
            await send_websocket_response(200)

    except WebSocketDisconnect:
        print('Websocket disconnected:', websocket.client)
        lobby_manager.disconnect(websocket)
        pass

import dataclasses

from fastapi import APIRouter
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from starlette.websockets import WebSocket, WebSocketDisconnect

from app.core.dependecies import get_db, get_current_active_user, get_current_user, manager
from app.core.internal import schemas
from app.game_engine import game_service
from app.game_engine.models import *
from app.game_engine.requests import *

router = APIRouter(
    tags=["game"],
    responses={404: {"description": "Not found"}},
)


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
            elif websocket_request.request_path in [GameApiRequestPath.ShootLaser, GameApiRequestPath.MovePiece,
                                                    GameApiRequestPath.RotatePiece]:
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

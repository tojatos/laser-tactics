import dataclasses

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from starlette.websockets import WebSocket, WebSocketDisconnect

from app.core.internal.crud import get_match_record
from app.core.dependecies import get_db, get_current_user, manager
from app.core.internal import schemas
from app.game_engine import game_service
from app.game_engine.requests import *
from app.game_engine.models import GameStateSerializable, empty_game_state

router = APIRouter(
    prefix="/game",
    tags=["game"],
    responses={404: {"error": "Not found"}, 422: {"error": "Invalid input data"}},
)


@router.get("/initial_game_state", response_model=GameStateSerializable)
async def get_initial_game_state():
    return empty_game_state("", "").to_serializable()


@router.get("/history/{game_id}", response_model=schemas.GameHistoryEntry)
async def get_match(game_id: str, db: Session = Depends(get_db)):
    return get_match_record(db=db, game_id=game_id)


# noinspection PyTypeChecker
async def websocket_endpoint(websocket: WebSocket,
                             db: Session = Depends(get_db)
                             ):
    async def send_websocket_response(status_code: int, body: str = ""):
        await websocket.send_json(dataclasses.asdict(WebsocketResponse(status_code, body)))

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
                    websocket.session["username"] = current_user.username
                    await send_websocket_response(200)
                except HTTPException as e:
                    await send_websocket_response(e.status_code, e.detail)
            elif websocket_request.request_path is GameApiRequestPath.WebsocketObserve:
                manager.observe(websocket_request.request.game_id, websocket)
                await send_websocket_response(200)
                await manager.notify(websocket_request.request.game_id, manager.get_observers(websocket_request.request.game_id))
            elif websocket_request.request_path is GameApiRequestPath.GetGameState:
                game_state = game_service.get_game_state(websocket_request.request, db)
                await websocket.send_json(dataclasses.asdict(game_state))
            elif websocket_request.request_path is GameApiRequestPath.get_observers:
                if websocket_request.request.game_id:
                    observers = manager.get_observers(websocket_request.request.game_id)
                    await websocket.send_json(observers)
            elif websocket_request.request_path in AuthenticatedGameApiRequestPaths:
                if current_user is None:
                    await send_websocket_response(401, "You are not authenticated.")
                else:
                    try:
                        if websocket_request.request_path is GameApiRequestPath.GiveUp:
                            game_service.give_up(current_user.username, websocket_request.request, db)
                        if websocket_request.request_path is GameApiRequestPath.OfferDraw:
                            game_service.offer_draw(current_user.username, websocket_request.request, db)
                        if websocket_request.request_path is GameApiRequestPath.ShootLaser:
                            game_service.shoot_laser(current_user.username, websocket_request.request, db)
                        if websocket_request.request_path is GameApiRequestPath.MovePiece:
                            game_service.move_piece(current_user.username, websocket_request.request, db)
                        if websocket_request.request_path is GameApiRequestPath.RotatePiece:
                            game_service.rotate_piece(current_user.username, websocket_request.request, db)
                        if websocket_request.request_path is GameApiRequestPath.Timeout:
                            game_service.timeout(current_user.username, websocket_request.request, db)
                        game_state = game_service.get_game_state(websocket_request.request, db)
                        await send_websocket_response(200)
                        await manager.notify(websocket_request.request.game_id, dataclasses.asdict(game_state))
                    except HTTPException as e:
                        await send_websocket_response(e.status_code, e.detail)
            else:
                await send_websocket_response(404)
    except WebSocketDisconnect:
        print('Websocked disconnected:', websocket.client)
        manager.disconnect(websocket)
        pass

import dataclasses
from fastapi import APIRouter, Depends, HTTPException
from fastapi import status
from fastapi.encoders import jsonable_encoder
from pydantic.dataclasses import dataclass
from sqlalchemy.orm import Session
from starlette.websockets import WebSocket, WebSocketDisconnect

from app.core.dependecies import get_db, get_current_user, chat_manager
from app.chat.requests import *
from app.chat import chat_service
from app.core.internal import schemas

router = APIRouter(
    prefix="/chat",
    tags=["chat"],
    responses={404: {"error": "Not found"}, 422: {"error": "Invalid input data"}},
)


# noinspection PyTypeChecker
async def chat_websocket_endpoint(websocket: WebSocket,
                                  db: Session = Depends(get_db)
                                  ):
    async def send_websocket_response(status_code: int, body: str = ""):
        await websocket.send_json(dataclasses.asdict(WebsocketResponse(status_code, body)))

    current_user: schemas.User = None
    await chat_manager.connect(websocket)
    try:
        while True:
            websocket_request_dict = await websocket.receive_json()
            websocket_request: WebsocketRequest = WebsocketRequest(**websocket_request_dict)
            if websocket_request.request_path is ChatApiRequestPath.WebsocketAuth:
                request: WebsocketAuthRequest = websocket_request.request
                token = request.token
                try:
                    current_user = await get_current_user(token, db)
                    await send_websocket_response(200)
                except HTTPException as e:
                    await send_websocket_response(e.status_code, e.detail)
            elif websocket_request.request_path is ChatApiRequestPath.WebsocketObserve:
                chat_manager.observe(websocket_request.request.game_id, websocket)
                await send_websocket_response(200)
            elif websocket_request.request_path is ChatApiRequestPath.GetGameChatRequest:
                chat = chat_service.get_chat(websocket_request.request, db)
                await websocket.send_json(dataclasses.asdict(chat))
            elif websocket_request.request_path in AuthenticatedChatApiRequestPaths:
                if current_user is None:
                    await send_websocket_response(401, "You are not authenticated.")
                else:
                    try:
                        if websocket_request.request_path is ChatApiRequestPath.SendMessageRequest:
                            chat = chat_service.send_message(current_user.username, websocket_request.request, db)
                        await send_websocket_response(200)
                        await chat_manager.notify(websocket_request.request.game_id, dataclasses.asdict(chat))
                    except HTTPException as e:
                        await send_websocket_response(e.status_code, e.detail)
            else:
                await send_websocket_response(404)
    except WebSocketDisconnect:
        print('Websocked disconnected:', websocket.client)
        chat_manager.disconnect(websocket)
        pass

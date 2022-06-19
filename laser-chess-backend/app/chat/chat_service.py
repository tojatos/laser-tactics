import json
import string
import dataclasses
from fastapi import HTTPException
from sqlalchemy.orm import Session
from .requests import GetGameChatRequest, SendMessageRequest, WebsocketAuthRequest, WebsocketObserveRequest
from .models import GameChat, Message
from app.core.internal import crud


def send_message(user: str, request: SendMessageRequest, db: Session):
    message = Message(payload=request.payload, username=user)
    crud.add_message_chat(db, message, request.game_id)
    return get_chat(GetGameChatRequest(request.game_id), db)


def get_chat(request: GetGameChatRequest, db: Session):
    chat_table = crud.get_chat(db, request.game_id)
    messages_json = chat_table.messages_json
    messages_dict_list = json.loads(messages_json)
    messages_list = [Message(**json.loads(message_dict)) for message_dict in messages_dict_list]
    chat = GameChat(chat_table.game_id, messages_list)
    return chat

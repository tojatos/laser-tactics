import json

from pydantic.dataclasses import dataclass
from typing import List


@dataclass
class Message:
    payload: str
    username: str

    def toJSON(self):
        return json.dumps(self, default=lambda o: {"payload" : o.payload, "username": o.username})


@dataclass
class GameChat:
    game_id: str
    messages: List[Message]


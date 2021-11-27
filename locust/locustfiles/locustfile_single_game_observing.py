import dataclasses

from locust import TaskSet, task, User, between

from game_requests import *
from socket_client import SocketClient


class WSBehavior(TaskSet):
    @task(1)
    def observe(self):
        # TODO: create game on demand
        game_id = "18992e54-bff9-4c3d-83b6-4fbe181d52f6"
        request = WebsocketRequest(GameApiRequestPath.WebsocketObserve, WebsocketObserveRequest(game_id))
        data = dataclasses.asdict(request)
        self.client.send(data)


class WSUser(User):
    host = "127.0.0.1"
    tasks = [WSBehavior]
    wait_time = between(0.1, 0.5)

    def __init__(self, *args, **kwargs):
        super(WSUser, self).__init__(*args, **kwargs)
        self.client = SocketClient(f'ws://{self.host}/ws')



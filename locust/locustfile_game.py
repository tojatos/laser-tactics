import dataclasses
import json
import logging
import time

import gevent
import websocket
from locust import TaskSet, task, events, User, between

from game_requests import *


@dataclass
class UserData:
    name: str
    email: str
    password: str


GENERATED_USERS_NUM = 500

# users = [UserData(f'locust_test_user{x}', f'locust_test_user{x}@example.com', 'pass') for x in
#          range(GENERATED_USERS_NUM)]


class SocketClient(object):
    def __init__(self, host):
        self.host = host
        self.ws = websocket.WebSocket()
        self.connect()

        events.quitting.add_listener(lambda environment: self.on_close())

    def connect(self):
        self.ws.settimeout(10)
        self.ws.connect(self.host)

    def send_with_response(self, payload):
        json_data = json.dumps(payload)

        g = gevent.spawn(self.ws.send, json_data)
        g.get(block=True, timeout=2)
        g = gevent.spawn(self.ws.recv)
        result = g.get(block=True, timeout=10)

        json_data = json.loads(result)
        return json_data

    def on_close(self):
        self.ws.close()

    def send(self, payload):
        start_time = time.time()
        try:
            data = self.send_with_response(payload)
            elapsed = int((time.time() - start_time) * 1000)
            events.request_success.fire(request_type='WS', name='send',
                                        response_time=elapsed,
                                        response_length=len(str(data)))
        except Exception as exp:
            elapsed = int((time.time() - start_time) * 1000)
            events.request_failure.fire(request_type='WS', name='send',
                                        response_time=elapsed, exception=exp)
            self.ws.close()
            self.connect()


class WSBehavior(TaskSet):
    @task(1)
    def observe(self):
        game_id = "18992e54-bff9-4c3d-83b6-4fbe181d52f6"
        request = WebsocketRequest(GameApiRequestPath.WebsocketObserve, WebsocketObserveRequest(game_id))
        data = dataclasses.asdict(request)
        self.client.send(data)


class WSUser(User):
    host = "127.0.0.1"
    tasks = [WSBehavior]
    wait_time = between(1, 5)

    def __init__(self, *args, **kwargs):
        super(WSUser, self).__init__(*args, **kwargs)
        self.client = SocketClient(f'ws://{self.host}/ws')


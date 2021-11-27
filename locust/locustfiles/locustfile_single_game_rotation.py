# WARNING: run this test with 2 users only.

import dataclasses
import logging
import random

import requests
from locust import TaskSet, task, User, between

from game_requests import *
from socket_client import SocketClient


@dataclass
class UserData:
    username: str
    email: str
    password: str


GENERATED_USERS_NUM = 2

users = [UserData(f'locust_test_user{x}', f'locust_test_user{x}@example.com', 'pass') for x in
         range(GENERATED_USERS_NUM)]

user_tokens = []

# get tokens
for user_data in users:
    user_exists = requests.get(f"http://localhost/api/v1/users/{user_data.username}").status_code == 200
    if not user_exists:
        logging.info(f"Creating user {user_data.username}")
        response = requests.post("http://localhost/api/v1/users", json={
            "username": user_data.username, "email": user_data.email, "password": user_data.password
        })
        assert response.status_code == 200
    logging.info(f"Login with {user_data.username} username and {user_data.password} password")

    response = requests.post("http://localhost/api/v1/token", headers={'Content-Type': 'application/x-www-form-urlencoded'}, data={"username": user_data.username, "password": user_data.password})
    assert response.status_code == 200
    token = response.json()['access_token']
    user_tokens.append(token)


class WSBehavior(TaskSet):
    @task(1)
    def observe(self):
        # TODO: create game on demand
        game_id = "e52ea2c7-e46d-4400-b1e4-f91f6aeec580"
        token = random.choice(user_tokens)

        request = WebsocketRequest(GameApiRequestPath.WebsocketAuth, WebsocketAuthRequest(token))
        data = dataclasses.asdict(request)
        response = self.client.send(data)
        assert response["status_code"] == 200

        cell_coordinates = random.choice([CellCoordinatesSerializable(0, 0), CellCoordinatesSerializable(8, 8)])

        request = WebsocketRequest(GameApiRequestPath.RotatePiece, RotatePieceRequest(game_id, cell_coordinates, 90))
        data = dataclasses.asdict(request)
        response = self.client.send(data)
        logging.info(response)


class WSUser(User):
    host = "127.0.0.1"
    tasks = [WSBehavior]
    wait_time = between(0.01, 0.1)

    def __init__(self, *args, **kwargs):
        super(WSUser, self).__init__(*args, **kwargs)
        self.client = SocketClient(f'ws://{self.host}/ws')

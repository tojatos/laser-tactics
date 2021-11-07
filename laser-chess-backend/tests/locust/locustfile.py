import time
from locust import TaskSet, task, HttpUser, between
import logging
from credentials import USER_CREDENTIALS


class RegisterWithUniqueUsersSteps(TaskSet):

    def on_start(self):
        if len(USER_CREDENTIALS) > 0:
            self.username, self.email, self.password = USER_CREDENTIALS.pop()

    @task
    def register(self):
        logging.info('Register with %s username, %s email and %s password', self.username, self.email, self.password)
        self.client.post("/users/", json={
            "username": self.username, "email": self.email, "password": self.password
        })
        while True:
            time.sleep(1)


class LoginWithUniqueUsersSteps(TaskSet):

    def on_start(self):
        if len(USER_CREDENTIALS) > 0:
            self.username, self.email, self.password = USER_CREDENTIALS.pop()

    @task
    def login(self):
        logging.info('Register with %s username, %s email and %s password', self.username, self.email, self.password)
        with self.client.post("/token", json={
            "username": self.username, "password": self.password
        }) as response:
            self.client.get(
                "/users/me/",
                headers={"authorization": "Bearer " + response['access_token']})


class LoginWithUniqueUsersTest(HttpUser):
    wait_time = between(1, 5)
    tasks = {LoginWithUniqueUsersSteps: 5}
    host = "http://localhost/api/v1"
    sock = None


class RegisterWithUniqueUsersTest(HttpUser):
    wait_time = between(1, 5)
    tasks = {RegisterWithUniqueUsersSteps: 5}
    host = "http://localhost/api/v1"
    sock = None


class LaserTacticsGuestUser(HttpUser):
    @task
    def users(self):
        self.client.get("/users/")

    @task
    def lobby(self):
        self.client.get("/lobby?skip=0&limit=100")

        

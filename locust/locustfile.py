import csv
import time
from json import JSONDecodeError
from random import choice

import requests
from locust import TaskSet, task, HttpUser, between
import logging

# TODO figure out how to do setup for entire process?
with open('testdata.csv', 'r+') as f_uc:
    reader = csv.reader(f_uc)
    USER_CREDENTIALS = list(reader)

with open('usernames.csv', 'r+') as f_u:
    reader = csv.reader(f_u)
    USERNAMES = list(reader)

"""
# For now this makes sure users are in database, run it if they aren't
for line in USER_CREDENTIALS:
    username, email, password = line
    requests.post("http://localhost/api/v1/users/", json={
        "username": username, "email": email, "password": password
    })
"""


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


# TODO debug
class FriendsModule(TaskSet):

    def on_start(self):
        if len(USER_CREDENTIALS) > 0:
            self.username, self.email, self.password = USER_CREDENTIALS.pop()
            logging.info('Login with %s username and %s password', self.username, self.password)
            with self.client.post("/token",
                                  headers={'Content-Type': 'application/x-www-form-urlencoded'},
                                  data={"username": self.username, "password": self.password
                                        }) as response:
                self.token = response.json()['access_token']

    @task(10)
    def get_friends(self):
        self.client.get(
            "/users/me/friends",
            headers={"authorization": "Bearer " + self.token})

    @task(10)
    def send_random_friend_request(self):
        username = choice(USERNAMES)
        with self.client.post(
                "/users/me/friends/requests/send",
                headers={"authorization": "Bearer " + self.token},
                params={'friend_username': username}) as response:
            logging.info(response)

    @task(3)
    def accept_random_request(self):
        with self.client.get(
                "/users/me/friends/requests",
                headers={"authorization": "Bearer " + self.token}) as response:
            # ?
            logging.info(response.json())
            f_requests = list(response.json())
            if len(f_requests) > 0:
                req = choice(f_requests)
                with self.client.post(
                        f"/users/me/friends/requests/accept?request_id={req['id']}",
                        headers={"authorization": "Bearer " + self.token}) as response1:
                    logging.info(response1.json())

    @task(4)
    def decline_random_request(self):
        with self.client.get(
                "/users/me/friends/requests",
                headers={"authorization": "Bearer " + self.token}) as response:
            # ?
            logging.info(response.json())
            f_requests = list(response.json())
            if len(f_requests) > 0:
                req = choice(f_requests)
                with self.client.post(
                        f"/users/me/friends/requests/decline?request_id={req['id']}",
                        headers={"authorization": "Bearer " + self.token}) as response1:
                    logging.info(response1.json())

    @task(1)
    def stop(self):
        self.interrupt()


class LoginWithUniqueUsersSteps(TaskSet):

    def on_start(self):
        if len(USER_CREDENTIALS) > 0:
            self.username, self.email, self.password = USER_CREDENTIALS.pop()

    @task
    def login(self):
        logging.info('Login with %s username and %s password', self.username, self.password)
        with self.client.post("/token",
                              headers={'Content-Type': 'application/x-www-form-urlencoded'},
                              data={"username": self.username, "password": self.password
                                    }) as response:
            try:
                self.client.get(
                    "/users/me/",
                    headers={"authorization": "Bearer " + response.json()['access_token']})
            except JSONDecodeError:
                response.failure("Response could not be decoded as JSON")
            except KeyError:
                response.failure("Response did not contain expected key 'access_token'")


"""
class LoginWithUniqueUsersTest(HttpUser):
    wait_time = between(1, 5)
    tasks = {LoginWithUniqueUsersSteps: 5}
    host = "http://localhost/api/v1"
    sock = None

"""


class FriendsTest(HttpUser):
    wait_time = between(1, 5)
    tasks = {FriendsModule: 5}
    host = "http://localhost/api/v1"
    sock = None


""" Figure this one out later
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
"""

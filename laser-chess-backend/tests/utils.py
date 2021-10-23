import dataclasses

from starlette.testclient import TestClient


def get_token_data(create_user_data):
    return dict(username=create_user_data['username'], password=create_user_data['password'])


@dataclasses.dataclass
class TestUtils:
    client: TestClient
    api_prefix: str

    def make_request(self, method: str, path: str, token: str = None, **kwargs):
        if token is None:
            return self.client.request(method, self.api_prefix + path, **kwargs)
        else:
            return self.client.request(method, self.api_prefix + path, headers={"Authorization": f"Bearer {token}"},
                                       **kwargs)

    def post_data(self, path: str, token: str = None, **kwargs):
        return self.make_request('POST', path, token, **kwargs)

    def get_data(self, path: str, token: str = None, **kwargs):
        return self.make_request('GET', path, token, **kwargs)

    def post_create_user(self, create_user_data):
        self.post_data("/users/", json=create_user_data)
        response = self.post_data("/token", data=get_token_data(create_user_data))
        token = response.json()["access_token"]
        return token

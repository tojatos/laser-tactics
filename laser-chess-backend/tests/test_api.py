def test_openapi(tu):
    response = tu.get_data("/openapi.json")
    assert response.status_code == 200, response.text


def test_create_user(tu):
    response = tu.post_data("/users/", json={"username": "deadpool", "email": "deadpool@example.com",
                                             "password": "chimichangas4life"})
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["email"] == "deadpool@example.com"

    response = tu.post_data("/token", data={"username": "deadpool", "password": "chimichangas4life"})
    assert response.status_code == 200, response.text
    data = response.json()
    assert "access_token" in data

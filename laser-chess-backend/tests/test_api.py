def test_openapi(tu):
    response = tu.get_data("/openapi.json")
    assert response.status_code == 200, response.text


def test_create_user(tu):
    response = tu.post_data("/users", json={"username": "deadpool", "email": "deadpool@example.com",
                                            "password": "chimichangas4life"})
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["email"] == "deadpool@example.com"

    response = tu.post_data("/token", data={"username": "deadpool", "password": "chimichangas4life"})
    assert response.status_code == 200, response.text
    data = response.json()
    assert "access_token" in data


def test_create_user_name_too_long(tu):
    response = tu.post_data("/users", json={"username": "Lorem Ipsum is simply dummy text of the printing and "
                                                        "typesetting industry. Lorem Ipsum has been the industry's "
                                                        "standard dummy text ever since the 1500s, when an unknown "
                                                        "printer took a galley of type and scrambled it to make a "
                                                        "type specimen book. It has survived not only five centuries, "
                                                        "but also the leap into electronic typesetting, "
                                                        "remaining essentially unchanged. It was popularised in the "
                                                        "1960s with the release of Letraset sheets containing Lorem "
                                                        "Ipsum passages, and more recently with desktop publishing "
                                                        "software like Aldus PageMaker including versions of Lorem "
                                                        "Ipsum.", "email": "deadpool@example.com",
                                            "password": "chimichangas4life"})
    print(response.json())
    assert response.status_code == 422


def test_create_user_name_too_short(tu):
    response = tu.post_data("/users", json={"username": "a", "email": "deadpool@example.com",
                                            "password": "chimichangas4life"})
    print(response.json())
    assert response.status_code == 422

def test_initial_game_state(tu):
    response = tu.get_data("/game/initial_game_state")
    assert response.status_code == 200

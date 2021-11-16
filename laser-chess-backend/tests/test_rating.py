from app.Rating import rating, schemas


def glickman():
    player = schemas.PlayerRatingUpdate(rating=1500, rating_deviation=200, volatility=0.06)
    matches = [schemas.PlayerMatchResult(player2_rating=1400, player2_rating_deviation=40, result=1),
               schemas.PlayerMatchResult(player2_rating=1550, player2_rating_deviation=100, result=0),
               schemas.PlayerMatchResult(player2_rating=1700, player2_rating_deviation=300, result=0)]
    return player, schemas.PlayerMatchHistory(matches=matches)


# need to test for inconsistent performance
def test_og_calc():
    player, matches = glickman()
    new_rating = rating.update_rating(player, matches)
    assert new_rating.rating == 1463
    assert new_rating.rating_deviation == 151.6
    assert new_rating.volatility == 0.06

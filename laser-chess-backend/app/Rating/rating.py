from app.Rating import glicko2

from .schemas import PlayerMatchHistory, PlayerRatingUpdate

# set constant tau
glicko2.Player._tau = 0.5


def get_starting_rating():
    return PlayerRatingUpdate(rating=1500, rating_deviation=200, volatility=0.06)


def update_rating(player_data: PlayerRatingUpdate, match_history: PlayerMatchHistory):
    player = glicko2.Player(rating=player_data.rating, rd=player_data.rating_deviation, vol=player_data.volatility)
    ratings = [match.player2_rating for match in match_history.matches]
    rds = [match.player2_rating_deviation for match in match_history.matches]
    results = [match.result for match in match_history.matches]
    player.update_player(ratings, rds, results)
    updated_player_rating = PlayerRatingUpdate(rating=round(player.rating, 2), rating_deviation=round(player.rd, 2), volatility=round(player.vol, 2))
    return updated_player_rating


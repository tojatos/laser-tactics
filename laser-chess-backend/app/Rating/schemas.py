from typing import List

from pydantic import BaseModel

"""
Every player in the Glicko-2 system has a rating, r, a rating deviation, RD, and a rating
volatility σ
"""


class PlayerRatingUpdate(BaseModel):
    rating: int
    rating_deviation: float
    volatility: float

"""
We now want to update the rating of a player with (Glicko-2) rating µ, rating deviation
φ, and volatility σ. He plays against m opponents with ratings µ1, . . . , µm, rating
deviations φ1, . . . , φm. Let s1, . . . , sm be the scores against each opponent (0 for a loss,
0.5 for a draw, and 1 for a win). The opponents’ volatilities are not relevant in the
calculations.
"""


class PlayerMatchResult(BaseModel):
    player2_rating: int
    player2_rating_deviation: float
    result: float


"""
The Glicko-2 system works best when the number of games in a rating period is moderate to large, say an average of at
least 10-15 games per player in a rating period. The length of time for a rating period is at
the discretion of the administrator.
"""


class PlayerMatchHistory(BaseModel):
    matches: List[PlayerMatchResult]

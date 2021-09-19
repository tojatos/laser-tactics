import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GameState } from './game.models';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(private http: HttpClient) { }

  async getGameState(): Promise<GameState> {
    const example_val = {
      "player_one_id": "string",
      "player_two_id": "string",
      "board": {
        "cells": [
          {
            "coordinates": {
              "x": 0,
              "y": 0
            },
            "piece": {
              "piece_type": "9",
              "piece_owner": "1",
              "rotation_degree": 0
            }
          },
          {
            "coordinates": {
              "x": 1,
              "y": 0
            },
            "piece": {
              "piece_type": "9",
              "piece_owner": "1",
              "rotation_degree": 0
            }
          },
          {
            "coordinates": {
              "x": 2,
              "y": 0
            },
            "piece": {
              "piece_type": "3",
              "piece_owner": "1",
              "rotation_degree": 0
            }
          },
          {
            "coordinates": {
              "x": 3,
              "y": 0
            },
            "piece": {
              "piece_type": "4",
              "piece_owner": "1",
              "rotation_degree": 0
            }
          },
          {
            "coordinates": {
              "x": 4,
              "y": 0
            },
            "piece": {
              "piece_type": "6",
              "piece_owner": "1",
              "rotation_degree": 0
            }
          },
          {
            "coordinates": {
              "x": 5,
              "y": 0
            },
            "piece": {
              "piece_type": "7",
              "piece_owner": "1",
              "rotation_degree": 0
            }
          },
          {
            "coordinates": {
              "x": 6,
              "y": 0
            },
            "piece": {
              "piece_type": "3",
              "piece_owner": "1",
              "rotation_degree": 90
            }
          },
          {
            "coordinates": {
              "x": 7,
              "y": 0
            },
            "piece": {
              "piece_type": "9",
              "piece_owner": "1",
              "rotation_degree": 270
            }
          },
          {
            "coordinates": {
              "x": 8,
              "y": 0
            },
            "piece": {
              "piece_type": "9",
              "piece_owner": "1",
              "rotation_degree": 270
            }
          },
          {
            "coordinates": {
              "x": 0,
              "y": 1
            },
            "piece": {
              "piece_type": "9",
              "piece_owner": "1",
              "rotation_degree": 270
            }
          },
          {
            "coordinates": {
              "x": 1,
              "y": 1
            },
            "piece": {
              "piece_type": "2",
              "piece_owner": "1",
              "rotation_degree": 0
            }
          },
          {
            "coordinates": {
              "x": 2,
              "y": 1
            },
            "piece": {
              "piece_type": "2",
              "piece_owner": "1",
              "rotation_degree": 0
            }
          },
          {
            "coordinates": {
              "x": 3,
              "y": 1
            },
            "piece": {
              "piece_type": "8",
              "piece_owner": "1",
              "rotation_degree": 0
            }
          },
          {
            "coordinates": {
              "x": 4,
              "y": 1
            },
            "piece": {
              "piece_type": "8",
              "piece_owner": "1",
              "rotation_degree": 90
            }
          },
          {
            "coordinates": {
              "x": 5,
              "y": 1
            },
            "piece": {
              "piece_type": "1",
              "piece_owner": "1",
              "rotation_degree": 0
            }
          },
          {
            "coordinates": {
              "x": 6,
              "y": 1
            },
            "piece": {
              "piece_type": "2",
              "piece_owner": "1",
              "rotation_degree": 0
            }
          },
          {
            "coordinates": {
              "x": 7,
              "y": 1
            },
            "piece": {
              "piece_type": "2",
              "piece_owner": "1",
              "rotation_degree": 0
            }
          },
          {
            "coordinates": {
              "x": 8,
              "y": 1
            },
            "piece": {
              "piece_type": "9",
              "piece_owner": "1",
              "rotation_degree": 0
            }
          },
          {
            "coordinates": {
              "x": 4,
              "y": 4
            },
            "piece": {
              "piece_type": "5",
              "piece_owner": "3",
              "rotation_degree": 0
            }
          },
          {
            "coordinates": {
              "x": 0,
              "y": 7
            },
            "piece": {
              "piece_type": "9",
              "piece_owner": "2",
              "rotation_degree": 180
            }
          },
          {
            "coordinates": {
              "x": 1,
              "y": 7
            },
            "piece": {
              "piece_type": "2",
              "piece_owner": "2",
              "rotation_degree": 180
            }
          },
          {
            "coordinates": {
              "x": 2,
              "y": 7
            },
            "piece": {
              "piece_type": "2",
              "piece_owner": "2",
              "rotation_degree": 180
            }
          },
          {
            "coordinates": {
              "x": 3,
              "y": 7
            },
            "piece": {
              "piece_type": "1",
              "piece_owner": "2",
              "rotation_degree": 180
            }
          },
          {
            "coordinates": {
              "x": 4,
              "y": 7
            },
            "piece": {
              "piece_type": "8",
              "piece_owner": "2",
              "rotation_degree": 90
            }
          },
          {
            "coordinates": {
              "x": 5,
              "y": 7
            },
            "piece": {
              "piece_type": "8",
              "piece_owner": "2",
              "rotation_degree": 0
            }
          },
          {
            "coordinates": {
              "x": 6,
              "y": 7
            },
            "piece": {
              "piece_type": "2",
              "piece_owner": "2",
              "rotation_degree": 180
            }
          },
          {
            "coordinates": {
              "x": 7,
              "y": 7
            },
            "piece": {
              "piece_type": "2",
              "piece_owner": "2",
              "rotation_degree": 180
            }
          },
          {
            "coordinates": {
              "x": 8,
              "y": 7
            },
            "piece": {
              "piece_type": "9",
              "piece_owner": "2",
              "rotation_degree": 90
            }
          },
          {
            "coordinates": {
              "x": 0,
              "y": 8
            },
            "piece": {
              "piece_type": "9",
              "piece_owner": "2",
              "rotation_degree": 90
            }
          },
          {
            "coordinates": {
              "x": 1,
              "y": 8
            },
            "piece": {
              "piece_type": "9",
              "piece_owner": "2",
              "rotation_degree": 90
            }
          },
          {
            "coordinates": {
              "x": 2,
              "y": 8
            },
            "piece": {
              "piece_type": "3",
              "piece_owner": "2",
              "rotation_degree": 90
            }
          },
          {
            "coordinates": {
              "x": 3,
              "y": 8
            },
            "piece": {
              "piece_type": "7",
              "piece_owner": "2",
              "rotation_degree": 0
            }
          },
          {
            "coordinates": {
              "x": 4,
              "y": 8
            },
            "piece": {
              "piece_type": "6",
              "piece_owner": "2",
              "rotation_degree": 0
            }
          },
          {
            "coordinates": {
              "x": 5,
              "y": 8
            },
            "piece": {
              "piece_type": "4",
              "piece_owner": "2",
              "rotation_degree": 0
            }
          },
          {
            "coordinates": {
              "x": 6,
              "y": 8
            },
            "piece": {
              "piece_type": "3",
              "piece_owner": "2",
              "rotation_degree": 0
            }
          },
          {
            "coordinates": {
              "x": 7,
              "y": 8
            },
            "piece": {
              "piece_type": "9",
              "piece_owner": "2",
              "rotation_degree": 180
            }
          },
          {
            "coordinates": {
              "x": 8,
              "y": 8
            },
            "piece": {
              "piece_type": "9",
              "piece_owner": "2",
              "rotation_degree": 180
            }
          }
        ]
      },
      "is_started": false,
      "turn_number": 0
    }

    return new Promise<GameState>((resolve, reject) => {
      resolve(example_val)
    })
  }
}

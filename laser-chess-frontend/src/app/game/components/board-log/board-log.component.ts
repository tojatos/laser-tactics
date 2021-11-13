import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { GameEvent, GameState } from '../../game.models';

const gameState: GameState = JSON.parse(`
{
  "player_one_id": "string",
  "player_two_id": "string2",
  "board": {
    "cells": [
      {
        "coordinates": {
          "x": 0,
          "y": 0
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 1,
          "y": 0
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 2,
          "y": 0
        },
        "piece": {
          "piece_type": "HYPER_CUBE",
          "piece_owner": "PLAYER_ONE",
          "rotation_degree": 0
        }
      },
      {
        "coordinates": {
          "x": 3,
          "y": 0
        },
        "piece": {
          "piece_type": "MIRROR",
          "piece_owner": "PLAYER_ONE",
          "rotation_degree": 90
        }
      },
      {
        "coordinates": {
          "x": 4,
          "y": 0
        },
        "piece": {
          "piece_type": "KING",
          "piece_owner": "PLAYER_ONE",
          "rotation_degree": 0
        }
      },
      {
        "coordinates": {
          "x": 5,
          "y": 0
        },
        "piece": {
          "piece_type": "LASER",
          "piece_owner": "PLAYER_ONE",
          "rotation_degree": 0
        }
      },
      {
        "coordinates": {
          "x": 6,
          "y": 0
        },
        "piece": {
          "piece_type": "DIAGONAL_MIRROR",
          "piece_owner": "PLAYER_ONE",
          "rotation_degree": 90
        }
      },
      {
        "coordinates": {
          "x": 7,
          "y": 0
        },
        "piece": {
          "piece_type": "TRIANGULAR_MIRROR",
          "piece_owner": "PLAYER_ONE",
          "rotation_degree": 270
        }
      },
      {
        "coordinates": {
          "x": 8,
          "y": 0
        },
        "piece": {
          "piece_type": "TRIANGULAR_MIRROR",
          "piece_owner": "PLAYER_ONE",
          "rotation_degree": 270
        }
      },
      {
        "coordinates": {
          "x": 0,
          "y": 1
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 1,
          "y": 1
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 2,
          "y": 1
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 3,
          "y": 1
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 4,
          "y": 1
        },
        "piece": {
          "piece_type": "MIRROR",
          "piece_owner": "PLAYER_ONE",
          "rotation_degree": 0
        }
      },
      {
        "coordinates": {
          "x": 5,
          "y": 1
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 6,
          "y": 1
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 7,
          "y": 1
        },
        "piece": {
          "piece_type": "BLOCK",
          "piece_owner": "PLAYER_ONE",
          "rotation_degree": 0
        }
      },
      {
        "coordinates": {
          "x": 8,
          "y": 1
        },
        "piece": {
          "piece_type": "TRIANGULAR_MIRROR",
          "piece_owner": "PLAYER_ONE",
          "rotation_degree": 0
        }
      },
      {
        "coordinates": {
          "x": 0,
          "y": 2
        },
        "piece": {
          "piece_type": "TRIANGULAR_MIRROR",
          "piece_owner": "PLAYER_TWO",
          "rotation_degree": 180
        }
      },
      {
        "coordinates": {
          "x": 1,
          "y": 2
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 2,
          "y": 2
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 3,
          "y": 2
        },
        "piece": {
          "piece_type": "BLOCK",
          "piece_owner": "PLAYER_ONE",
          "rotation_degree": 0
        }
      },
      {
        "coordinates": {
          "x": 4,
          "y": 2
        },
        "piece": {
          "piece_type": "BEAM_SPLITTER",
          "piece_owner": "PLAYER_ONE",
          "rotation_degree": 0
        }
      },
      {
        "coordinates": {
          "x": 5,
          "y": 2
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 6,
          "y": 2
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 7,
          "y": 2
        },
        "piece": {
          "piece_type": "BLOCK",
          "piece_owner": "PLAYER_ONE",
          "rotation_degree": 0
        }
      },
      {
        "coordinates": {
          "x": 8,
          "y": 2
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 0,
          "y": 3
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 1,
          "y": 3
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 2,
          "y": 3
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 3,
          "y": 3
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 4,
          "y": 3
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 5,
          "y": 3
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 6,
          "y": 3
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 7,
          "y": 3
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 8,
          "y": 3
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 0,
          "y": 4
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 1,
          "y": 4
        },
        "piece": {
          "piece_type": "BLOCK",
          "piece_owner": "PLAYER_TWO",
          "rotation_degree": 180
        }
      },
      {
        "coordinates": {
          "x": 2,
          "y": 4
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 3,
          "y": 4
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 4,
          "y": 4
        },
        "piece": {
          "piece_type": "HYPER_SQUARE",
          "piece_owner": "NONE",
          "rotation_degree": 0
        }
      },
      {
        "coordinates": {
          "x": 5,
          "y": 4
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 6,
          "y": 4
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 7,
          "y": 4
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 8,
          "y": 4
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 0,
          "y": 5
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 1,
          "y": 5
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 2,
          "y": 5
        },
        "piece": {
          "piece_type": "TRIANGULAR_MIRROR",
          "piece_owner": "PLAYER_ONE",
          "rotation_degree": 0
        }
      },
      {
        "coordinates": {
          "x": 3,
          "y": 5
        },
        "piece": {
          "piece_type": "DIAGONAL_MIRROR",
          "piece_owner": "PLAYER_ONE",
          "rotation_degree": 0
        }
      },
      {
        "coordinates": {
          "x": 4,
          "y": 5
        },
        "piece": {
          "piece_type": "TRIANGULAR_MIRROR",
          "piece_owner": "PLAYER_ONE",
          "rotation_degree": 0
        }
      },
      {
        "coordinates": {
          "x": 5,
          "y": 5
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 6,
          "y": 5
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 7,
          "y": 5
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 8,
          "y": 5
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 0,
          "y": 6
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 1,
          "y": 6
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 2,
          "y": 6
        },
        "piece": {
          "piece_type": "DIAGONAL_MIRROR",
          "piece_owner": "PLAYER_TWO",
          "rotation_degree": 0
        }
      },
      {
        "coordinates": {
          "x": 3,
          "y": 6
        },
        "piece": {
          "piece_type": "BEAM_SPLITTER",
          "piece_owner": "PLAYER_TWO",
          "rotation_degree": 180
        }
      },
      {
        "coordinates": {
          "x": 4,
          "y": 6
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 5,
          "y": 6
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 6,
          "y": 6
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 7,
          "y": 6
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 8,
          "y": 6
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 0,
          "y": 7
        },
        "piece": {
          "piece_type": "TRIANGULAR_MIRROR",
          "piece_owner": "PLAYER_TWO",
          "rotation_degree": 180
        }
      },
      {
        "coordinates": {
          "x": 1,
          "y": 7
        },
        "piece": {
          "piece_type": "KING",
          "piece_owner": "PLAYER_TWO",
          "rotation_degree": 0
        }
      },
      {
        "coordinates": {
          "x": 2,
          "y": 7
        },
        "piece": {
          "piece_type": "BLOCK",
          "piece_owner": "PLAYER_TWO",
          "rotation_degree": 180
        }
      },
      {
        "coordinates": {
          "x": 3,
          "y": 7
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 4,
          "y": 7
        },
        "piece": {
          "piece_type": "MIRROR",
          "piece_owner": "PLAYER_TWO",
          "rotation_degree": 0
        }
      },
      {
        "coordinates": {
          "x": 5,
          "y": 7
        },
        "piece": {
          "piece_type": "MIRROR",
          "piece_owner": "PLAYER_TWO",
          "rotation_degree": 90
        }
      },
      {
        "coordinates": {
          "x": 6,
          "y": 7
        },
        "piece": {
          "piece_type": "TRIANGULAR_MIRROR",
          "piece_owner": "PLAYER_ONE",
          "rotation_degree": 180
        }
      },
      {
        "coordinates": {
          "x": 7,
          "y": 7
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 8,
          "y": 7
        },
        "piece": {
          "piece_type": "TRIANGULAR_MIRROR",
          "piece_owner": "PLAYER_TWO",
          "rotation_degree": 90
        }
      },
      {
        "coordinates": {
          "x": 0,
          "y": 8
        },
        "piece": {
          "piece_type": "TRIANGULAR_MIRROR",
          "piece_owner": "PLAYER_TWO",
          "rotation_degree": 90
        }
      },
      {
        "coordinates": {
          "x": 1,
          "y": 8
        },
        "piece": {
          "piece_type": "TRIANGULAR_MIRROR",
          "piece_owner": "PLAYER_TWO",
          "rotation_degree": 90
        }
      },
      {
        "coordinates": {
          "x": 2,
          "y": 8
        },
        "piece": {
          "piece_type": "DIAGONAL_MIRROR",
          "piece_owner": "PLAYER_TWO",
          "rotation_degree": 90
        }
      },
      {
        "coordinates": {
          "x": 3,
          "y": 8
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 4,
          "y": 8
        },
        "piece": {
          "piece_type": "HYPER_CUBE",
          "piece_owner": "PLAYER_TWO",
          "rotation_degree": 0
        }
      },
      {
        "coordinates": {
          "x": 5,
          "y": 8
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 6,
          "y": 8
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 7,
          "y": 8
        },
        "piece": null
      },
      {
        "coordinates": {
          "x": 8,
          "y": 8
        },
        "piece": null
      }
    ]
  },
  "game_phase": "STARTED",
  "turn_number": 46,
  "game_events": [
    {
      "moved_from": {
        "x": 5,
        "y": 1
      },
      "moved_to": {
        "x": 5,
        "y": 2
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 3,
        "y": 0
      },
      "moved_to": {
        "x": 2,
        "y": 0
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "teleported_from": {
        "x": 2,
        "y": 0
      },
      "teleported_to": {
        "x": 6,
        "y": 5
      },
      "teleported_by": {
        "piece_type": "HYPER_CUBE",
        "piece_owner": "PLAYER_ONE",
        "rotation_degree": 0
      },
      "event_type": "TELEPORT_EVENT"
    },
    {
      "moved_from": {
        "x": 3,
        "y": 7
      },
      "moved_to": {
        "x": 3,
        "y": 6
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 6,
        "y": 7
      },
      "moved_to": {
        "x": 6,
        "y": 6
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 6,
        "y": 5
      },
      "moved_to": {
        "x": 5,
        "y": 5
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 5,
        "y": 5
      },
      "moved_to": {
        "x": 4,
        "y": 5
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 6,
        "y": 6
      },
      "moved_to": {
        "x": 6,
        "y": 5
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 6,
        "y": 5
      },
      "moved_to": {
        "x": 6,
        "y": 4
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 2,
        "y": 0
      },
      "moved_to": {
        "x": 2,
        "y": 1
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "teleported_from": {
        "x": 2,
        "y": 1
      },
      "teleported_to": {
        "x": 3,
        "y": 4
      },
      "teleported_by": {
        "piece_type": "HYPER_CUBE",
        "piece_owner": "PLAYER_ONE",
        "rotation_degree": 0
      },
      "event_type": "TELEPORT_EVENT"
    },
    {
      "moved_from": {
        "x": 3,
        "y": 4
      },
      "moved_to": {
        "x": 4,
        "y": 4
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "teleported_from": {
        "x": 4,
        "y": 4
      },
      "teleported_to": {
        "x": 1,
        "y": 4
      },
      "teleported_by": {
        "piece_type": "HYPER_SQUARE",
        "piece_owner": "NONE",
        "rotation_degree": 0
      },
      "event_type": "TELEPORT_EVENT"
    },
    {
      "moved_from": {
        "x": 5,
        "y": 8
      },
      "moved_to": {
        "x": 6,
        "y": 8
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "teleported_from": {
        "x": 6,
        "y": 8
      },
      "teleported_to": {
        "x": 2,
        "y": 6
      },
      "teleported_by": {
        "piece_type": "HYPER_CUBE",
        "piece_owner": "PLAYER_TWO",
        "rotation_degree": 0
      },
      "event_type": "TELEPORT_EVENT"
    },
    {
      "moved_from": {
        "x": 6,
        "y": 4
      },
      "moved_to": {
        "x": 5,
        "y": 4
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 4,
        "y": 5
      },
      "moved_to": {
        "x": 3,
        "y": 5
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 5,
        "y": 2
      },
      "moved_to": {
        "x": 4,
        "y": 2
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 6,
        "y": 8
      },
      "moved_to": {
        "x": 7,
        "y": 8
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "teleported_from": {
        "x": 7,
        "y": 8
      },
      "teleported_to": {
        "x": 0,
        "y": 2
      },
      "teleported_by": {
        "piece_type": "HYPER_CUBE",
        "piece_owner": "PLAYER_TWO",
        "rotation_degree": 0
      },
      "event_type": "TELEPORT_EVENT"
    },
    {
      "moved_from": {
        "x": 5,
        "y": 4
      },
      "moved_to": {
        "x": 4,
        "y": 4
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "teleported_from": {
        "x": 4,
        "y": 4
      },
      "teleported_to": {
        "x": 3,
        "y": 3
      },
      "teleported_by": {
        "piece_type": "HYPER_SQUARE",
        "piece_owner": "NONE",
        "rotation_degree": 0
      },
      "event_type": "TELEPORT_EVENT"
    },
    {
      "moved_from": {
        "x": 2,
        "y": 1
      },
      "moved_to": {
        "x": 1,
        "y": 1
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "teleported_from": {
        "x": 1,
        "y": 1
      },
      "teleported_to": {
        "x": 2,
        "y": 3
      },
      "teleported_by": {
        "piece_type": "HYPER_CUBE",
        "piece_owner": "PLAYER_ONE",
        "rotation_degree": 0
      },
      "event_type": "TELEPORT_EVENT"
    },
    {
      "moved_from": {
        "x": 2,
        "y": 3
      },
      "moved_to": {
        "x": 3,
        "y": 3
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "taken_on": {
        "x": 3,
        "y": 3
      },
      "piece_that_took_type": "BLOCK",
      "piece_taken_type": "BLOCK",
      "event_type": "PIECE_TAKEN_EVENT"
    },
    {
      "moved_from": {
        "x": 7,
        "y": 8
      },
      "moved_to": {
        "x": 7,
        "y": 7
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "teleported_from": {
        "x": 7,
        "y": 7
      },
      "teleported_to": {
        "x": 6,
        "y": 3
      },
      "teleported_by": {
        "piece_type": "HYPER_CUBE",
        "piece_owner": "PLAYER_TWO",
        "rotation_degree": 0
      },
      "event_type": "TELEPORT_EVENT"
    },
    {
      "moved_from": {
        "x": 6,
        "y": 3
      },
      "moved_to": {
        "x": 6,
        "y": 4
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 1,
        "y": 1
      },
      "moved_to": {
        "x": 0,
        "y": 1
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "teleported_from": {
        "x": 0,
        "y": 1
      },
      "teleported_to": {
        "x": 4,
        "y": 6
      },
      "teleported_by": {
        "piece_type": "HYPER_CUBE",
        "piece_owner": "PLAYER_ONE",
        "rotation_degree": 0
      },
      "event_type": "TELEPORT_EVENT"
    },
    {
      "moved_from": {
        "x": 4,
        "y": 6
      },
      "moved_to": {
        "x": 5,
        "y": 6
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 7,
        "y": 7
      },
      "moved_to": {
        "x": 7,
        "y": 8
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 7,
        "y": 8
      },
      "moved_to": {
        "x": 8,
        "y": 8
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "teleported_from": {
        "x": 8,
        "y": 8
      },
      "teleported_to": {
        "x": 6,
        "y": 2
      },
      "teleported_by": {
        "piece_type": "HYPER_CUBE",
        "piece_owner": "PLAYER_TWO",
        "rotation_degree": 0
      },
      "event_type": "TELEPORT_EVENT"
    },
    {
      "rotated_piece_at": {
        "x": 5,
        "y": 6
      },
      "rotation": 270,
      "event_type": "PIECE_ROTATED_EVENT"
    },
    {
      "laser_path": [
        {
          "time": 0,
          "coordinates": {
            "x": 5,
            "y": 0
          },
          "event_type": "LASER_SHOT_EVENT"
        },
        {
          "time": 1,
          "coordinates": {
            "x": 5,
            "y": 1
          },
          "event_type": "LASER_SHOT_EVENT"
        },
        {
          "time": 2,
          "coordinates": {
            "x": 5,
            "y": 2
          },
          "event_type": "LASER_SHOT_EVENT"
        },
        {
          "time": 3,
          "coordinates": {
            "x": 5,
            "y": 3
          },
          "event_type": "LASER_SHOT_EVENT"
        },
        {
          "time": 4,
          "coordinates": {
            "x": 5,
            "y": 4
          },
          "event_type": "LASER_SHOT_EVENT"
        },
        {
          "time": 5,
          "coordinates": {
            "x": 5,
            "y": 5
          },
          "event_type": "LASER_SHOT_EVENT"
        },
        {
          "time": 6,
          "coordinates": {
            "x": 5,
            "y": 6
          },
          "event_type": "LASER_SHOT_EVENT"
        },
        {
          "time": 7,
          "coordinates": {
            "x": 4,
            "y": 6
          },
          "event_type": "LASER_SHOT_EVENT"
        },
        {
          "time": 8,
          "coordinates": {
            "x": 3,
            "y": 6
          },
          "event_type": "LASER_SHOT_EVENT"
        },
        {
          "time": 9,
          "coordinates": {
            "x": 3,
            "y": 7
          },
          "event_type": "LASER_SHOT_EVENT"
        },
        {
          "time": 10,
          "coordinates": {
            "x": 3,
            "y": 8
          },
          "event_type": "LASER_SHOT_EVENT"
        }
      ],
      "event_type": "LASER_SHOT_EVENT"
    },
    {
      "destroyed_on": {
        "x": 3,
        "y": 8
      },
      "piece_destroyed": {
        "piece_type": "LASER",
        "piece_owner": "PLAYER_TWO",
        "rotation_degree": 180
      },
      "laser_destroy_time": 10,
      "event_type": "PIECE_DESTROYED_EVENT"
    },
    {
      "moved_from": {
        "x": 6,
        "y": 4
      },
      "moved_to": {
        "x": 5,
        "y": 4
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 5,
        "y": 4
      },
      "moved_to": {
        "x": 4,
        "y": 4
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "teleported_from": {
        "x": 4,
        "y": 4
      },
      "teleported_to": {
        "x": 3,
        "y": 2
      },
      "teleported_by": {
        "piece_type": "HYPER_SQUARE",
        "piece_owner": "NONE",
        "rotation_degree": 0
      },
      "event_type": "TELEPORT_EVENT"
    },
    {
      "moved_from": {
        "x": 3,
        "y": 3
      },
      "moved_to": {
        "x": 3,
        "y": 2
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "taken_on": {
        "x": 3,
        "y": 2
      },
      "piece_that_took_type": "BLOCK",
      "piece_taken_type": "BLOCK",
      "event_type": "PIECE_TAKEN_EVENT"
    },
    {
      "moved_from": {
        "x": 3,
        "y": 1
      },
      "moved_to": {
        "x": 3,
        "y": 0
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 8,
        "y": 8
      },
      "moved_to": {
        "x": 7,
        "y": 8
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 7,
        "y": 8
      },
      "moved_to": {
        "x": 6,
        "y": 8
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 0,
        "y": 1
      },
      "moved_to": {
        "x": 0,
        "y": 0
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "teleported_from": {
        "x": 0,
        "y": 0
      },
      "teleported_to": {
        "x": 4,
        "y": 5
      },
      "teleported_by": {
        "piece_type": "HYPER_CUBE",
        "piece_owner": "PLAYER_ONE",
        "rotation_degree": 0
      },
      "event_type": "TELEPORT_EVENT"
    },
    {
      "moved_from": {
        "x": 6,
        "y": 1
      },
      "moved_to": {
        "x": 6,
        "y": 2
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "taken_on": {
        "x": 6,
        "y": 2
      },
      "piece_that_took_type": "BLOCK",
      "piece_taken_type": "TRIANGULAR_MIRROR",
      "event_type": "PIECE_TAKEN_EVENT"
    },
    {
      "moved_from": {
        "x": 6,
        "y": 8
      },
      "moved_to": {
        "x": 5,
        "y": 8
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 1,
        "y": 7
      },
      "moved_to": {
        "x": 1,
        "y": 6
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 0,
        "y": 0
      },
      "moved_to": {
        "x": 1,
        "y": 0
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "teleported_from": {
        "x": 1,
        "y": 0
      },
      "teleported_to": {
        "x": 2,
        "y": 5
      },
      "teleported_by": {
        "piece_type": "HYPER_CUBE",
        "piece_owner": "PLAYER_ONE",
        "rotation_degree": 0
      },
      "event_type": "TELEPORT_EVENT"
    },
    {
      "moved_from": {
        "x": 6,
        "y": 2
      },
      "moved_to": {
        "x": 7,
        "y": 2
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 1,
        "y": 6
      },
      "moved_to": {
        "x": 1,
        "y": 5
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 1,
        "y": 5
      },
      "moved_to": {
        "x": 1,
        "y": 4
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "taken_on": {
        "x": 1,
        "y": 4
      },
      "piece_that_took_type": "BLOCK",
      "piece_taken_type": "BLOCK",
      "event_type": "PIECE_TAKEN_EVENT"
    },
    {
      "moved_from": {
        "x": 5,
        "y": 6
      },
      "moved_to": {
        "x": 6,
        "y": 6
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 6,
        "y": 6
      },
      "moved_to": {
        "x": 6,
        "y": 7
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 5,
        "y": 8
      },
      "moved_to": {
        "x": 4,
        "y": 8
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "teleported_from": {
        "x": 4,
        "y": 8
      },
      "teleported_to": {
        "x": 2,
        "y": 1
      },
      "teleported_by": {
        "piece_type": "HYPER_CUBE",
        "piece_owner": "PLAYER_TWO",
        "rotation_degree": 0
      },
      "event_type": "TELEPORT_EVENT"
    },
    {
      "moved_from": {
        "x": 2,
        "y": 1
      },
      "moved_to": {
        "x": 2,
        "y": 0
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 1,
        "y": 0
      },
      "moved_to": {
        "x": 2,
        "y": 0
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "teleported_from": {
        "x": 2,
        "y": 0
      },
      "teleported_to": {
        "x": 1,
        "y": 7
      },
      "teleported_by": {
        "piece_type": "HYPER_CUBE",
        "piece_owner": "PLAYER_ONE",
        "rotation_degree": 0
      },
      "event_type": "TELEPORT_EVENT"
    }
  ],
  "user_events": [
    {
      "moved_from": {
        "x": 5,
        "y": 1
      },
      "moved_to": {
        "x": 5,
        "y": 2
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 3,
        "y": 0
      },
      "moved_to": {
        "x": 2,
        "y": 0
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 3,
        "y": 7
      },
      "moved_to": {
        "x": 3,
        "y": 6
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 6,
        "y": 7
      },
      "moved_to": {
        "x": 6,
        "y": 6
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 6,
        "y": 5
      },
      "moved_to": {
        "x": 5,
        "y": 5
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 5,
        "y": 5
      },
      "moved_to": {
        "x": 4,
        "y": 5
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 6,
        "y": 6
      },
      "moved_to": {
        "x": 6,
        "y": 5
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 6,
        "y": 5
      },
      "moved_to": {
        "x": 6,
        "y": 4
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 2,
        "y": 0
      },
      "moved_to": {
        "x": 2,
        "y": 1
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 3,
        "y": 4
      },
      "moved_to": {
        "x": 4,
        "y": 4
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 5,
        "y": 8
      },
      "moved_to": {
        "x": 6,
        "y": 8
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 6,
        "y": 4
      },
      "moved_to": {
        "x": 5,
        "y": 4
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 4,
        "y": 5
      },
      "moved_to": {
        "x": 3,
        "y": 5
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 5,
        "y": 2
      },
      "moved_to": {
        "x": 4,
        "y": 2
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 6,
        "y": 8
      },
      "moved_to": {
        "x": 7,
        "y": 8
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 5,
        "y": 4
      },
      "moved_to": {
        "x": 4,
        "y": 4
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 2,
        "y": 1
      },
      "moved_to": {
        "x": 1,
        "y": 1
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 2,
        "y": 3
      },
      "moved_to": {
        "x": 3,
        "y": 3
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 7,
        "y": 8
      },
      "moved_to": {
        "x": 7,
        "y": 7
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 6,
        "y": 3
      },
      "moved_to": {
        "x": 6,
        "y": 4
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 1,
        "y": 1
      },
      "moved_to": {
        "x": 0,
        "y": 1
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 4,
        "y": 6
      },
      "moved_to": {
        "x": 5,
        "y": 6
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 7,
        "y": 7
      },
      "moved_to": {
        "x": 7,
        "y": 8
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 7,
        "y": 8
      },
      "moved_to": {
        "x": 8,
        "y": 8
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "rotated_piece_at": {
        "x": 5,
        "y": 6
      },
      "rotation": 270,
      "event_type": "PIECE_ROTATED_EVENT"
    },
    {
      "laser_shot": true,
      "event_type": "SHOOT_LASER_EVENT"
    },
    {
      "moved_from": {
        "x": 6,
        "y": 4
      },
      "moved_to": {
        "x": 5,
        "y": 4
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 5,
        "y": 4
      },
      "moved_to": {
        "x": 4,
        "y": 4
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 3,
        "y": 3
      },
      "moved_to": {
        "x": 3,
        "y": 2
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 3,
        "y": 1
      },
      "moved_to": {
        "x": 3,
        "y": 0
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 8,
        "y": 8
      },
      "moved_to": {
        "x": 7,
        "y": 8
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 7,
        "y": 8
      },
      "moved_to": {
        "x": 6,
        "y": 8
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 0,
        "y": 1
      },
      "moved_to": {
        "x": 0,
        "y": 0
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 6,
        "y": 1
      },
      "moved_to": {
        "x": 6,
        "y": 2
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 6,
        "y": 8
      },
      "moved_to": {
        "x": 5,
        "y": 8
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 1,
        "y": 7
      },
      "moved_to": {
        "x": 1,
        "y": 6
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 0,
        "y": 0
      },
      "moved_to": {
        "x": 1,
        "y": 0
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 6,
        "y": 2
      },
      "moved_to": {
        "x": 7,
        "y": 2
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 1,
        "y": 6
      },
      "moved_to": {
        "x": 1,
        "y": 5
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 1,
        "y": 5
      },
      "moved_to": {
        "x": 1,
        "y": 4
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 5,
        "y": 6
      },
      "moved_to": {
        "x": 6,
        "y": 6
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 6,
        "y": 6
      },
      "moved_to": {
        "x": 6,
        "y": 7
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 5,
        "y": 8
      },
      "moved_to": {
        "x": 4,
        "y": 8
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 2,
        "y": 1
      },
      "moved_to": {
        "x": 2,
        "y": 0
      },
      "event_type": "PIECE_MOVED_EVENT"
    },
    {
      "moved_from": {
        "x": 1,
        "y": 0
      },
      "moved_to": {
        "x": 2,
        "y": 0
      },
      "event_type": "PIECE_MOVED_EVENT"
    }
  ]
}
`)

@Component({
  selector: 'app-board-log',
  templateUrl: './board-log.component.html',
  styleUrls: ['./board-log.component.scss']
})
export class BoardLogComponent implements OnInit {

  @Output() gameLogEmitter = new EventEmitter<GameEvent[]>();

  constructor() { }

  ngOnInit(): void {
  }

  buildEvent() {
    console.log("d")
    this.gameLogEmitter.emit(gameState.game_events)
  }

}

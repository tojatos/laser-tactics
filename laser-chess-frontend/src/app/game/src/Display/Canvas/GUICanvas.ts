import { Inject } from "@angular/core"
import { AuthService } from "src/app/auth/auth.service"
import { EventEmitterService } from "src/app/game/services/event-emitter.service"
import { GameService } from "src/app/game/services/game.service"
import { Board } from "../../board"
import { Resources } from "../Resources"
import { Canvas } from "./AbstractCanvas"

export class GUICanvas extends Canvas {

  interactable: boolean = false
  gameId!: string
  currentPlayer = this.authService.getCurrentJwtInfo().sub

  constructor(private gameService: GameService, private authService: AuthService, private eventEmitter: EventEmitterService, @Inject(Resources) resources: Resources) {
    super(resources)
  }

}

import { Injectable } from "@angular/core"
import { AuthService } from "src/app/auth/auth.service"
import { EventEmitterService } from "src/app/game/services/event-emitter.service"
import { GameService } from "src/app/game/services/game.service"
import { Resources } from "../Resources"
import { Canvas } from "./AbstractCanvas"

@Injectable()
export class GUICanvas extends Canvas {

  interactable: boolean = false
  gameId!: string
  currentPlayer = this.authService.getCurrentJwtInfo().sub

  constructor(private gameService: GameService, private authService: AuthService, private eventEmitter: EventEmitterService) {
    super()
  }

  initCanvas(ctx: CanvasRenderingContext2D, resources: Resources){
    this.ctx = ctx
  }

}

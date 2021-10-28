import { AuthService } from "src/app/auth/auth.service"
import { EventEmitterService } from "src/app/game/services/event-emitter.service"
import { GameService } from "src/app/game/services/game.service"
import { Board } from "../../board"
import { Drawings } from "../Drawings"
import { Resources } from "../Resources"
import { Canvas } from "./AbstractCanvas"
import { GameCanvas } from "./GameCanvas"

export class GUICanvas extends Canvas {

  interactable: boolean = false
  gameCanvas!: GameCanvas
  currentPlayer = this.authService.getCurrentJwtInfo().sub

  constructor(private gameService: GameService,
    private authService: AuthService,
    private eventEmitter: EventEmitterService,
    drawings: Drawings,
    ctx: CanvasRenderingContext2D,
    blockSize: number,
    resources: Resources,
    gameId: string) {
    super(ctx, blockSize, drawings, resources, gameId)
  }

  initCanvas(board: Board, gameCanvas: GameCanvas){
    this.ctx.canvas.addEventListener('click', (e) => this.canvasOnclick(e, board), false)
    this.ctx.canvas.hidden = true
  }

  private async canvasOnclick(event: MouseEvent, board: Board) { }

}

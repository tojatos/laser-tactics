import { AuthService } from "src/app/auth/auth.service"
import { GameWebsocketService } from "src/app/game/services/gameService/game-websocket.service"
import { COLS, ROWS } from "../../constants"
import { Animations } from "../Animations"
import { Drawings } from "../Drawings"
import { Resources } from "../Resources"

export abstract class Canvas {

  interactable: boolean = false
  currentPlayer = this.authService.getCurrentJwtInfo()?.sub
  isReversed: boolean = false

  constructor(protected readonly gameService: GameWebsocketService, protected readonly authService: AuthService, public readonly ctx: CanvasRenderingContext2D, public blockSize: number, protected readonly animations: Animations, protected readonly drawings: Drawings, public readonly resources: Resources, protected readonly gameId: string) {
      this.ctx.canvas.width = COLS * this.blockSize
      this.ctx.canvas.height = ROWS * this.blockSize
  }

  protected getMousePos(event: MouseEvent){
    const rect = this.ctx.canvas.getBoundingClientRect();

    if(this.isReversed)
      return {
        x: COLS - 1 - Math.floor((event.clientX - rect.left) / this.blockSize),
        y: Math.floor((event.clientY - rect.top) / this.blockSize)
      }

    return {
      x: Math.floor((event.clientX - rect.left) / this.blockSize),
      y: ROWS - 1 - Math.floor((event.clientY - rect.top) / this.blockSize)
    }
  }

  protected getRawMousePos(event: MouseEvent){
    const rect = this.ctx.canvas.getBoundingClientRect();

    return {
      x: Math.floor((event.clientX - rect.left)),
      y: Math.floor((event.clientY - rect.top))
    }
  }

}

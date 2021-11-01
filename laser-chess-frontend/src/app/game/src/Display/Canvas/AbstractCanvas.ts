import { AuthService } from "src/app/auth/auth.service"
import { Board } from "../../board"
import { COLS, ROWS } from "../../constants"
import { Animations } from "../Animations"
import { Drawings } from "../Drawings"
import { Resources } from "../Resources"

export abstract class Canvas {

  interactable: boolean = false
  currentPlayer = this.authService.getCurrentJwtInfo()?.sub

  constructor(protected readonly authService: AuthService, public readonly ctx: CanvasRenderingContext2D, public blockSize: number, protected readonly animations: Animations, protected readonly drawings: Drawings, public readonly resources: Resources, protected readonly gameId: string) {
      this.ctx.canvas.width = COLS * this.blockSize
      this.ctx.canvas.height = ROWS * this.blockSize
  }

  protected getMousePos(event: MouseEvent){
    const rect = this.ctx.canvas.getBoundingClientRect();

    return {
      x: Math.floor((event.clientX - rect.left) / this.blockSize),
      y: 8 - Math.floor((event.clientY - rect.top) / this.blockSize)
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

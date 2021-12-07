import { COLS, ROWS } from "../../constants"
import { Resources } from "../Resources"

export class Canvas {

  interactable: boolean = false
  isReversed: boolean = false
  showAnimations: boolean = true
  ctx!: CanvasRenderingContext2D
  numberOfAdditionalCanvas = 0

  constructor(public canvas: HTMLCanvasElement, public blockSize: number, public resources: Resources) {
      this.canvas.width = COLS * this.blockSize
      this.canvas.height = ROWS * this.blockSize
      this.ctx = canvas.getContext('2d')!
  }

  createAdditionalCanvasElement(){
    const gameContainerName = "game-container"

    this.numberOfAdditionalCanvas++
    const newCanvas = document.createElement('canvas');
    newCanvas.width = this.ctx.canvas.width
    newCanvas.height = this.ctx.canvas.height
    newCanvas.style.position = "absolute"
    newCanvas.style.zIndex = (2 + this.numberOfAdditionalCanvas).toString()

    document.body.getElementsByClassName(gameContainerName)[0].appendChild(newCanvas)

    if(this.canvas.getContext('2d'))
      return new Canvas(newCanvas, this.blockSize, this.resources)

    return undefined
  }

  deleteSelf(){
    this.canvas.remove()
  }

}

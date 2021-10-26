import { Drawings } from "../Drawings"
import { Resources } from "../Resources"

export abstract class Canvas {
  ctx!: CanvasRenderingContext2D
  drawings!: Drawings

  constructor(public resources: Resources) {}
}

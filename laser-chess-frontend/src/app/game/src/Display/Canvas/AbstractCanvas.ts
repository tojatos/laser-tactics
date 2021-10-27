import { Drawings } from "../Drawings"

export abstract class Canvas {
  ctx!: CanvasRenderingContext2D
  drawings!: Drawings

  constructor() {}
}

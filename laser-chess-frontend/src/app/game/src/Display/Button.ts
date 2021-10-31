import { Coordinates } from "src/app/game/game.models";
import { COLS } from "../constants";
import { ButtonTypes } from "../enums";

export class Button {
  originPosition!: Coordinates
  width!: number
  height!: number

  constructor(private blockSize: number, public buttonType: ButtonTypes, public image: HTMLImageElement) {
    this.setSizes()
  }

  updateSizes(newBlockSize: number){
    this.blockSize = newBlockSize
    this.setSizes()
  }

  setSizes(){
    switch(this.buttonType){
      case ButtonTypes.LEFT_ARROW_BUTTON: {
        this.originPosition = this.leftTopCornerCoordinates
        this.width = this.rotationButtonSize.width
        this.height = this.rotationButtonSize.height
      } break;
      case ButtonTypes.RIGHT_ARROW_BUTTON: {
        this.originPosition = this.rightTopCornerCoordinates
        this.width = this.rotationButtonSize.width
        this.height = this.rotationButtonSize.height
      } break;
      case ButtonTypes.LASER_BUTTON: {
        this.originPosition = this.middleBottomCoordinates
        this.width = this.laserButtonSize.width
        this.height = this.laserButtonSize.height
      } break;
      case ButtonTypes.ACCEPT_BUTTON: {
        this.originPosition = this.middleTopCoordinates
        this.width = this.acceptButtonSize.width
        this.height = this.acceptButtonSize.height
      } break;
    }
  }

  checkIfPressed(mousePos: Coordinates){
    return mousePos.x >= this.originPosition.x && mousePos.x <= this.originPosition.x + this.width
    && mousePos.y >= this.originPosition.y && mousePos.y <= this.originPosition.y + this.height
  }

  get leftTopCornerCoordinates() { return {x: this.blockSize, y: this.blockSize * COLS - this.blockSize * 2.5}}
  get rightTopCornerCoordinates() { return {x: this.blockSize * COLS - this.blockSize * 2.5, y: this.blockSize * COLS - this.blockSize * 2.5}}
  get middleTopCoordinates() { return {x: this.blockSize * COLS / 2 - this.blockSize * 1.5, y: this.blockSize * 1.5}}
  get middleBottomCoordinates() { return {x: this.blockSize * COLS / 2 - this.blockSize * 1.5, y: this.blockSize * COLS - this.blockSize * 2.5}}
  get rotationButtonSize() { return {height: this.blockSize * 1.5, width: this.blockSize * 1.5}}
  get laserButtonSize() { return {height: this.blockSize * 1.5, width: this.blockSize * 2.5}}
  get acceptButtonSize() { return {height: this.blockSize * 1.5, width: this.blockSize * 2.5}}

}

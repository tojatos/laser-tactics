import { Coordinates } from "../../game.models";
import { ButtonTypes, PieceType } from "../enums";

export class Button {

  positionOrigin: Coordinates
  positionEnd: Coordinates
  type: ButtonTypes

  constructor(positionOrigin: Coordinates, positionEnd: Coordinates, type: ButtonTypes) {
    this.positionOrigin = positionOrigin
    this.positionEnd = positionEnd
    this.type = type
  }

  executeAction(){
    switch(this.type){
      case(ButtonTypes.LASER_BUTTON): this.laserButtonAction(); break
      case(ButtonTypes.RIGHT_ARROW_BUTTON): this.rightArrowAction(); break
      case(ButtonTypes.LEFT_ARROW_BUTTON): this.leftArrowAction(); break
    }
  }

  private laserButtonAction(){

  }

  private rightArrowAction(){

  }

  private leftArrowAction(){

  }



}

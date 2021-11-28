import { HttpResponse } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { Coordinates, GameState } from "../../game.models"

@Injectable({
  providedIn: 'root'
})
export abstract class AbstractGameService {

  abstract getGameState(gameId: string): Promise<HttpResponse<GameState>> | void
  abstract movePiece(gameId: string, from: Coordinates, to: Coordinates): Promise<void> | void
  abstract rotatePiece(gameId: string, at: Coordinates, angle: number): Promise<void> | void
  abstract shootLaser(gameId: string): Promise<void> | void

  increaseAnimationEvents(){
    const num = parseInt(localStorage.getItem("animationEvents") || "0") + 1
    localStorage.setItem("animationEvents", num.toString())
  }

  setAnimationEventsNum(num: number){
    localStorage.setItem("animationEvents", num.toString())
  }

  numOfAnimationEvents(){
    return parseInt(localStorage.getItem("animationEvents") || "0")
  }

  animationsToShow(totalNumOfAnimations: number){
    return totalNumOfAnimations - this.numOfAnimationEvents()
  }

}

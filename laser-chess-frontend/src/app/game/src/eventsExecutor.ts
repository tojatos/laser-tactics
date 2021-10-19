import { Injectable } from "@angular/core";
import { GameEvent } from "../game.models";
import { GameService } from "../services/game.service";
import { Board } from "./board";
import { Canvas } from "./Canvas/Canvas";

@Injectable()
export class EventsExecutor{

    constructor(private canvas: Canvas, private gameService: GameService) {}

    eventsToExecute : GameEvent[] = []

    addEventsToExecute(events: GameEvent[]){
        this.eventsToExecute.push(...events)
    }

    async executeEvents(timeout: number, board: Board){

        for (const event of this.eventsToExecute){
            if(event){
                await new Promise(resolve => setTimeout(resolve, timeout))
                await this.canvas.getAnimationToExecute(board, event)
                this.gameService.increaseAnimationEvents()
                board.executeEvent(event)
                this.gameService.setLocalGameState(board.serialize())
                this.canvas.drawings.drawGame(board.cells)
            }
        }

        this.eventsToExecute = []
    }

}
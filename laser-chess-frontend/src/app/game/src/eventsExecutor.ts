import { Injectable } from "@angular/core";
import { cloneDeep, curry, groupBy, values } from "lodash";
import { Coordinates, GameEvent, LaserShotEventEntity } from "../game.models";
import { GameService } from "../services/game.service";
import { Board } from "./board";
import { GameCanvas } from "./Display/Canvas/GameCanvas";
import { GameEvents } from "./enums";

type PathInfo = {
  from: Coordinates,
  to: Coordinates,
  time: number
}

@Injectable()
export class EventsExecutor{

    constructor(private canvas: GameCanvas, private gameService: GameService) {}

    eventsQueue : GameEvent[] = []
    eventsExecutionTimeout = 500

    addEventsToExecute(events: GameEvent[]){
        this.eventsQueue.push(...events)
    }

    async executeEventsQueue(board: Board, timeout: number = this.eventsExecutionTimeout){
      for (const event of this.eventsQueue){
        if(event){
          console.log("executing a single action")
          await new Promise(resolve => setTimeout(resolve, timeout))
          await this.getAnimationToExecute(board, event)
          console.log("single action executed!")
          this.gameService.increaseAnimationEvents()
          board.executeEvent(event)
          this.gameService.setLocalGameState(board.serialize())
          this.canvas.drawings.drawGame(board.cells)
        }
      }
      console.log("all actions executed!")
      this.eventsQueue = []
    }

    async executeLaserAnimations(board: Board, laserPath: LaserShotEventEntity[]){

      const res = values(groupBy(laserPath, 'time'))
      const allPathsToDraw: PathInfo[] = []
      const laserCellCoor = board.getLaserCell()?.coordinates // wont be shown if no laser is present, shouldnt be dependant on that
      // should get other player laser / itd better to get that info from backend

      //if(laserCellCoor){

        this.startPath(res[1], res.flat(), res[0][0], allPathsToDraw)
        const allPaths = values(groupBy(allPathsToDraw, 'time'))

        return new Promise<void>(async resolve => {
          for (const path of allPaths)
            await Promise.all(path.map(p => this.canvas.getLaserPathAnimation(board, p.from, p.to)))
          console.log("shot all lazor paths! Awaiting for 1 second to disappear")
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log("anim i done!")
        resolve()
        })
      //}

    }

    getAnimationToExecute(board: Board, gameEvent: GameEvent){
      switch(gameEvent.event_type){
        case GameEvents.PIECE_ROTATED_EVENT : return this.canvas.animations.rotatePiece(board, board.getCellByCoordinates(gameEvent.rotated_piece_at.x, gameEvent.rotated_piece_at.y), gameEvent.rotation)
        case GameEvents.PIECE_MOVED_EVENT : return this.canvas.animations.movePiece(board, gameEvent.moved_from, gameEvent.moved_to)
        case GameEvents.TELEPORT_EVENT : return this.canvas.animations.movePiece(board, gameEvent.teleported_from, gameEvent.teleported_to)
        case GameEvents.LASER_SHOT_EVENT : return this.executeLaserAnimations(board, gameEvent.laser_path)
        default: return undefined
      }
    }

    private startPath(nextTime: LaserShotEventEntity[] | undefined, allEvents: LaserShotEventEntity[], firstElem: LaserShotEventEntity, savePlace: PathInfo[]){
      if(!nextTime)
        return

      for (const t of nextTime){
        if(this.checkIfCoordinatesAreRightAngle(firstElem.coordinates, t.coordinates)){
          savePlace.push({ from: firstElem.coordinates, to: t.coordinates, time: t.time })
          const newPath = this.buildPath(allEvents.filter(ae => ae.time == t.time + 1), allEvents, [firstElem, t], savePlace)
          if(newPath)
            this.startPath(allEvents.filter(ae => ae.time == newPath.time + 1), allEvents, newPath, savePlace)
        }
      }
    }

    private buildPath(nextTime: LaserShotEventEntity[] | undefined,
      allEvents: LaserShotEventEntity[],
      currentPath: LaserShotEventEntity[],
      savePlace: PathInfo[]): LaserShotEventEntity {

      if(!nextTime)
        return currentPath.slice(-1)[0]

      const newElem = this.getPathContinuation(currentPath, nextTime)
      if(!newElem)
        return currentPath.slice(-1)[0]

      savePlace.push({ from: currentPath.slice(-1)[0].coordinates, to: newElem.coordinates, time: newElem.time })
      return this.buildPath(allEvents.filter(ae => ae.time == newElem.time + 1), allEvents, [...currentPath, newElem], savePlace)

    }

    private checkIfCoordinatesAreRightAngle(coor1: Coordinates, coor2: Coordinates): boolean{
      return ((coor1.x - coor2.x == 0 && Math.abs(coor1.y - coor2.y) == 1) || (coor1.y - coor2.y == 0 && Math.abs(coor1.x - coor2.x) == 1))
    }

    private getPathContinuation(currentPath: LaserShotEventEntity[], allNextTimeEvents: LaserShotEventEntity[]): LaserShotEventEntity | undefined{
      return allNextTimeEvents.find(e => this.checkIfContinuationExists(currentPath, e))
    }

    private checkIfContinuationExists(currentPath: LaserShotEventEntity[], newElem: LaserShotEventEntity){
      const lastTwoElems = currentPath.slice(-2)
      const lastTwoElemsSubstraction = this.coordinatesSubstraction(lastTwoElems[0].coordinates, lastTwoElems[1].coordinates)
      const lastElemAndNewElemSubstraction = this.coordinatesSubstraction(lastTwoElems[1].coordinates, newElem.coordinates)
      return lastElemAndNewElemSubstraction.x == lastTwoElemsSubstraction.x && lastElemAndNewElemSubstraction.y == lastTwoElemsSubstraction.y
    }

    private coordinatesSubstraction(coor1: Coordinates, coor2: Coordinates){
      return {x: coor1.x - coor2.x, y: coor1.y - coor2.y}
    }

}


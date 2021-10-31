import { Injectable } from "@angular/core";
import { groupBy, values } from "lodash";
import { Coordinates, GameEvent, LaserShotEventEntity } from "../game.models";
import { GameService } from "../services/game.service";
import { Board } from "./board";
import { Animations } from "./Display/Animations";
import { Canvas } from "./Display/Canvas/AbstractCanvas";
import { Drawings } from "./Display/Drawings";
import { GameEvents } from "./enums";

type PathInfo = {
  from: Coordinates,
  to: Coordinates,
  time: number
}

@Injectable()
export class EventsExecutor{

    constructor(private gameService: GameService, private drawings: Drawings, private animations: Animations) {}

    eventsQueue : GameEvent[] = []
    eventsExecutionTimeout = 500

    addEventsToExecute(events: GameEvent[]){
        this.eventsQueue.push(...events)
    }

    async executeEventsQueue(canvas: Canvas, board: Board, timeout: number = this.eventsExecutionTimeout){
      for (const event of this.eventsQueue){
        if(event){
          await new Promise(resolve => setTimeout(resolve, timeout))
          await this.getAnimationToExecute(canvas, board, event)
          this.gameService.increaseAnimationEvents()
          board.executeEvent(event)
          this.gameService.setLocalGameState(board.serialize())
          this.drawings.drawGame(canvas, board.cells)
        }
      }
      this.eventsQueue = []
    }

    async executeLaserAnimations(canvas: Canvas, board: Board, laserPath: LaserShotEventEntity[]){
      const res = values(groupBy(laserPath, 'time'))
      const allPathsToDraw: PathInfo[] = []

        this.startPath(res[1], res.flat(), res[0][0], allPathsToDraw)
        const allPaths = values(groupBy(allPathsToDraw, 'time'))

        return new Promise<void>(async resolve => {
          for (const path of allPaths)
            await Promise.all(path.map(p => this.animations.laserAnimation(canvas, board, p.from, p.to)
            ))
        await new Promise(resolve => setTimeout(resolve, 1000))
        resolve()
        })

    }

    getAnimationToExecute(canvas: Canvas, board: Board, gameEvent: GameEvent){
      switch(gameEvent.event_type){
        case GameEvents.PIECE_ROTATED_EVENT : return this.animations.rotatePiece(canvas, board,
          board.getCellByCoordinates(gameEvent.rotated_piece_at.x, gameEvent.rotated_piece_at.y),
          gameEvent.rotation > 180 ? gameEvent.rotation - 360 : gameEvent.rotation)
        case GameEvents.PIECE_MOVED_EVENT : return this.animations.movePiece(canvas, board, gameEvent.moved_from, gameEvent.moved_to)
        case GameEvents.TELEPORT_EVENT : return this.animations.movePiece(canvas, board, gameEvent.teleported_from, gameEvent.teleported_to)
        case GameEvents.LASER_SHOT_EVENT : return this.executeLaserAnimations(canvas, board, gameEvent.laser_path)
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


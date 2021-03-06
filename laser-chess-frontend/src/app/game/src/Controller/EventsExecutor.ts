import { Injectable } from "@angular/core";
import { groupBy, values } from "lodash";
import { AuthService } from "src/app/auth/auth.service";
import { Coordinates, GameEvent, LaserShotEventEntity, PieceDestroyedEvent } from "../../game.models";
import { GameWebsocketService } from "../../services/game.service";
import { Board } from "../GameStateData/Board";
import { Animations } from "../Display/Animations";
import { Canvas } from "../Display/Canvas/Canvas";
import { Drawings } from "../Display/Drawings";
import { GameEvents } from "../Utils/Enums";
import { BoardLogComponent } from "../../components/board-log/board-log.component";

type PathInfo = {
  from: Coordinates,
  to: Coordinates,
  time: number
}

@Injectable()
export class EventsExecutor{

    constructor(private gameService: GameWebsocketService, private authService: AuthService, private drawings: Drawings, private animations: Animations) {}

    eventsQueue : GameEvent[] = []
    eventsExecutionTimeout = 500

    addEventsToExecute(events: GameEvent[]): void{
        this.eventsQueue.push(...events)
    }

    async executeEventsQueue(canvas: Canvas, board: Board, boardLogComponent: BoardLogComponent | undefined, showAnimations = true, enableSounds = true, showLaser = true, timeout: number = this.eventsExecutionTimeout): Promise<void>{
      for (const event of this.eventsQueue.filter(e => e.event_type != GameEvents.PIECE_DESTROYED_EVENT)){
        if(event){
          if(boardLogComponent && event.event_type != GameEvents.TELEPORT_EVENT)
            boardLogComponent.animatedHistorySelectionStep()
          await this.getAnimationToExecute(canvas, board, event, this.eventsQueue.indexOf(event), document.hidden ? false : showAnimations, enableSounds, showLaser)
          this.gameService.increaseAnimationEvents()
          board.executeEvent(event)
          if(board.gameId && event.event_type == GameEvents.OFFER_DRAW_EVENT && event.player != board.playerNum && board.isPlayer(this.authService.getUsername()))
            this.gameService.showDrawOffer(board.gameId)
          if(showAnimations && !document.hidden)
            await new Promise(resolve => setTimeout(resolve, timeout))
        }
      }
      this.eventsQueue = []
    }

    async executeLaserAnimations(canvas: Canvas, board: Board, laserPath: LaserShotEventEntity[], eventId: number, showAnimations: boolean, enableSounds: boolean, showLaser: boolean, laserShowDuration = 1000) : Promise<void>{
      const res = values(groupBy(laserPath, 'time'))
      const allPathsToDraw: PathInfo[] = []
      const allDestroyedPieceEventsAfterLastLaserShot: GameEvent[] = []

      for(let i = eventId + 1; i < this.eventsQueue.length; i++){
        if(this.eventsQueue[i].event_type == GameEvents.PIECE_DESTROYED_EVENT)
          allDestroyedPieceEventsAfterLastLaserShot.push(this.eventsQueue[i])
        else
          break
      }

        this.startPath(res[1], res.flat(), res[0][0], allPathsToDraw)
        const allPaths = values(groupBy(allPathsToDraw, 'time'))

        return new Promise<void>(resolve => {
          void (async () => {
          for (const path of allPaths)
            await Promise.all([
              this.animations.laserAnimation(canvas, board, path.map(p => [p.from, p.to]), canvas.isReversed, showAnimations, enableSounds),
              ...allDestroyedPieceEventsAfterLastLaserShot.filter(e => e.event_type == GameEvents.PIECE_DESTROYED_EVENT && e.laser_destroy_time == path[0].time)
              .map(e => this.animations.pieceDestroyedAnimation(canvas, board, (<PieceDestroyedEvent>e).destroyed_on, canvas.isReversed, showAnimations, enableSounds)) // clears field as well so laser is cut.
            ]
            )
        if(showLaser && !document.hidden)
          await new Promise(resolve => setTimeout(resolve, laserShowDuration))
        if(canvas.ctx){
          const w = canvas.ctx.canvas.width
          canvas.ctx.canvas.width = w
        }
        for (const pd of allDestroyedPieceEventsAfterLastLaserShot){
          board.executeEvent(pd)
          this.gameService.increaseAnimationEvents()
        }

        this.drawings.drawGame(canvas, board.cells, canvas.isReversed)
        allDestroyedPieceEventsAfterLastLaserShot.forEach(pde => void this.animations.pieceDestroyedAnimation(canvas, board, (<PieceDestroyedEvent>pde).destroyed_on, canvas.isReversed, false, false))
          resolve()
        })()
        })

    }

    getAnimationToExecute(canvas: Canvas, board: Board, gameEvent: GameEvent, eventId: number, showAnimations: boolean, enableSounds: boolean, showLaser: boolean): Promise<void> | undefined{
      switch(gameEvent.event_type){
        case GameEvents.PIECE_ROTATED_EVENT : return this.animations.rotatePiece(canvas, board,
          board.getCellByCoordinates(gameEvent.rotated_piece_at.x, gameEvent.rotated_piece_at.y),
          gameEvent.rotation > 180 ? gameEvent.rotation - 360 : gameEvent.rotation, canvas.isReversed, showAnimations, enableSounds)
        case GameEvents.PIECE_MOVED_EVENT : return this.animations.movePiece(canvas, board, gameEvent.moved_from, gameEvent.moved_to, canvas.isReversed, showAnimations, enableSounds)
        case GameEvents.TELEPORT_EVENT : return this.animations.movePiece(canvas, board, gameEvent.teleported_from, gameEvent.teleported_to, canvas.isReversed, showAnimations, enableSounds)
        case GameEvents.LASER_SHOT_EVENT : return this.executeLaserAnimations(canvas, board, gameEvent.laser_path, eventId, showAnimations, enableSounds, showLaser)
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


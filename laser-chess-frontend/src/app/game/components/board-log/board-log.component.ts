import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { cloneDeep } from 'lodash';
import { GameEvent, GameState } from '../../game.models';
import { GameEvents } from '../../src/enums';

@Component({
  selector: 'app-board-log',
  templateUrl: './board-log.component.html',
  styleUrls: ['./board-log.component.scss']
})
export class BoardLogComponent implements OnChanges {

  @Input() gameState: GameState | undefined
  @Input() maxHeight: number = 300
  @Output() gameLogEmitter = new EventEmitter<GameEvent[]>()
  @Output() gameReturnEmitter = new EventEmitter()
  @Output() giveUpEmitter = new EventEmitter()
  @Output() drawEmitter = new EventEmitter()

  notationList: string[] = []
  validGameState: GameState | undefined

  constructor() { }

  ngOnChanges(changes: SimpleChanges){
    if(changes.gameState && changes.gameState.currentValue?.game_events.length > 0){
      console.log(changes.gameState.currentValue)
      this.notationList = []
      this.validGameState = cloneDeep(this.gameState)
      this.validGameState!.user_events = this.validGameState!.user_events.filter(ue => ue.event_type != GameEvents.OFFER_DRAW_EVENT)
      this.validGameState!.game_events = this.validGameState!.game_events.filter(ge => ge.event_type != GameEvents.OFFER_DRAW_EVENT)
      this.validGameState?.user_events.forEach((_, i) => {
        this.notationList.push(this.eventNotation(i))
      })      
    }
  }

  buildEvent(gameEvents: GameEvent[]) {
    this.gameLogEmitter.emit(gameEvents)
  }

  returnToCurrentEvent(){
    this.gameReturnEmitter.emit()
  }

  onSelection(e: number){
    if(this.validGameState){
    this.gameLogEmitter.emit(this.getCorresponingEventChain(e)!.filter(evnt => evnt.event_type != GameEvents.OFFER_DRAW_EVENT))
    if(e == this.validGameState?.user_events.length-1)
      this.gameReturnEmitter.emit()
    
    }
  }

  getCorresponingEventChain(userEventIndex: number){
    let search = 0
    let iterator = 0
    if(this.validGameState){
      while(search <= userEventIndex + 1 && iterator < 100)
        if(this.isUserEvent(this.validGameState.game_events[iterator++]))
          search++

        return this.validGameState?.game_events.slice(0, iterator-1)
      }

    return undefined

  }

  eventNotation(userEventIndex: number){
    const corresponingEventChain = this.getCorresponingEventChain(userEventIndex)
    const lastUserEventInGameEventsIndex = corresponingEventChain?.reverse().findIndex(ge => this.isUserEvent(ge))
    const lastEvents = corresponingEventChain?.slice(0, lastUserEventInGameEventsIndex!+1)
    const subEventTeleport = lastEvents?.find(le => le.event_type == GameEvents.TELEPORT_EVENT)
    const subEventTaken = lastEvents?.find(le => le.event_type == GameEvents.PIECE_TAKEN_EVENT)
    
    console.log(lastEvents)

    if(lastEvents){
      const lastUserEvent = lastEvents.slice(-1)[0]
      if(subEventTeleport?.event_type == GameEvents.TELEPORT_EVENT){
        if(lastUserEvent.event_type == GameEvents.PIECE_MOVED_EVENT)
          return `${lastUserEvent.moved_from.x}_${lastUserEvent.moved_from.y} - 
          ${lastUserEvent.moved_to.x}_${lastUserEvent.moved_to.y} 
          (${subEventTeleport.teleported_to.x}_${subEventTeleport.teleported_to.y})`
      }
      else if (subEventTaken?.event_type == GameEvents.PIECE_TAKEN_EVENT){
        if(lastUserEvent.event_type == GameEvents.PIECE_MOVED_EVENT)
          return `${lastUserEvent.moved_from.x}_${lastUserEvent.moved_from.y} x ${lastUserEvent.moved_to.x}_${lastUserEvent.moved_to.y} `
      }
      else if (lastUserEvent.event_type == GameEvents.LASER_SHOT_EVENT)
        return "LASER"
      else if (lastUserEvent.event_type == GameEvents.PIECE_MOVED_EVENT)
        return `${lastUserEvent.moved_from.x}_${lastUserEvent.moved_from.y} - 
        ${lastUserEvent.moved_to.x}_${lastUserEvent.moved_to.y}`
      else if (lastUserEvent.event_type == GameEvents.PIECE_ROTATED_EVENT)
        return `${lastUserEvent.rotated_piece_at.x}_${lastUserEvent.rotated_piece_at.y} (${lastUserEvent.rotation})`
    }
    return "Unknown notation"

  }

  giveUp(){
    this.giveUpEmitter.emit()
  }

  draw(){
    this.drawEmitter.emit()
  }

  isUserEvent(gameEvent: GameEvent | undefined){
    return gameEvent?.event_type == GameEvents.PIECE_MOVED_EVENT 
        || gameEvent?.event_type == GameEvents.PIECE_ROTATED_EVENT
        || gameEvent?.event_type == GameEvents.LASER_SHOT_EVENT
        || gameEvent?.event_type == GameEvents.OFFER_DRAW_EVENT
  }

  getNotation(index: number){
    this.notationList[index]
  }

}

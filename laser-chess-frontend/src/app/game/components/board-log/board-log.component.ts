import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatSelectionList } from '@angular/material/list';
import { cloneDeep } from 'lodash';
import { GameEvent, GameState } from '../../game.models';
import { GameEvents } from '../../src/enums';

@Component({
  selector: 'app-board-log',
  templateUrl: './board-log.component.html',
  styleUrls: ['./board-log.component.scss']
})
export class BoardLogComponent implements OnChanges, OnDestroy {

  @ViewChild('userEvents')
  logList: MatSelectionList | undefined

  @Input() gameState: GameState | undefined
  @Input() maxHeight: number = 300
  @Input() gameFinished: boolean = false
  @Input() isSpectator: boolean = false
  @Output() gameLogEmitter = new EventEmitter<GameEvent[]>()
  @Output() gameReturnEmitter = new EventEmitter()
  @Output() giveUpEmitter = new EventEmitter()
  @Output() drawEmitter = new EventEmitter()

  notationList: string[] = []
  validGameState: GameState | undefined
  userEventChains: GameEvent[][] = []

  constructor() {}

  ngOnChanges(changes: SimpleChanges){
    if(changes.gameState){
      this.notationList = []
      this.userEventChains = []
      if(changes.gameState.currentValue?.game_events.length > 0){
        this.validGameState = cloneDeep(this.gameState)
        this.validGameState!.user_events = this.validGameState!.user_events.filter(ue => ue.event_type != GameEvents.OFFER_DRAW_EVENT && ue.event_type != GameEvents.GIVE_UP_EVENT)
        this.validGameState!.game_events = this.validGameState!.game_events.filter(ge => ge.event_type != GameEvents.OFFER_DRAW_EVENT && ge.event_type != GameEvents.GIVE_UP_EVENT)
        this.divideArrayOnUserEventChains()
        this.validGameState!.user_events.forEach((_, i) => {
          this.notationList.push(this.eventNotation(i))
        })
    }
  }
  }

  ngOnDestroy(){
    this.notationList = []
    this.gameReturnEmitter.emit()
  }

  buildEvent(gameEvents: GameEvent[]) {
    this.gameLogEmitter.emit(gameEvents)
  }

  returnToCurrentEvent(){
    this.logList?.deselectAll()
    this.gameReturnEmitter.emit()
  }

  onSelection(e: number){
    if(this.validGameState){
    if(e == this.userEventChains.length-1)
      this.returnToCurrentEvent()
    else
      this.gameLogEmitter.emit(this.userEventChains.slice(0, e+1).flat())
    }
  }

  divideArrayOnUserEventChains(){
    this.validGameState?.user_events.forEach(_ => {
      let search = 0
      let iterator = 0
      while(search < 2 && iterator < this.validGameState!.game_events.length + 1){
        if(this.isUserEvent(this.validGameState?.game_events[iterator++]))
          search++
      }
      this.userEventChains.push(this.validGameState!.game_events.splice(0, iterator-1))
    })
  }

  eventNotation(place: number){
    const lastEvents = this.userEventChains[place]
    const subEventTeleport = lastEvents?.find(le => le.event_type == GameEvents.TELEPORT_EVENT)
    const subEventTaken = lastEvents?.find(le => le.event_type == GameEvents.PIECE_TAKEN_EVENT)

    if(lastEvents){
      const lastUserEvent = lastEvents[0]
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
        || gameEvent?.event_type == GameEvents.GIVE_UP_EVENT
  }

}

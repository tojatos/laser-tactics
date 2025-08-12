import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { cloneDeep } from 'lodash';
import { GameEvent, GameState, UserEvent, PieceMovedEvent, PieceRotatedEvent, TeleportEvent } from '../../game.models';
import { GameEvents } from '../../src/Utils/Enums';

type Coordinates = { x: number; y: number };

@Component({
  selector: 'app-board-log',
  templateUrl: './board-log.component.html',
  styleUrls: ['./board-log.component.scss'],
})
export class BoardLogComponent implements OnChanges, OnDestroy {

  @Input() gameState?: GameState;
  @Input() maxHeight = 300;
  @Input() gameFinished = false;
  @Input() isSpectator = false;
  @Output() gameLogEmitter = new EventEmitter<[GameEvent[], boolean]>();
  @Output() gameReturnEmitter = new EventEmitter<void>();
  @Output() giveUpEmitter = new EventEmitter<void>();
  @Output() drawEmitter = new EventEmitter<void>();

  notationList: string[] = [];
  validGameState?: GameState;
  userEventChains: GameEvent[][] = [];
  spectableHistory = true;
  currentHistorySelection = -1;
  selectedMoveIndex = -1;

  private readonly EXCLUDED_EVENT_TYPES = [
    GameEvents.OFFER_DRAW_EVENT,
    GameEvents.GIVE_UP_EVENT,
    GameEvents.TIMEOUT_EVENT
  ] as const;

  private readonly USER_EVENT_TYPES = [
    GameEvents.PIECE_MOVED_EVENT,
    GameEvents.PIECE_ROTATED_EVENT,
    GameEvents.LASER_SHOT_EVENT,
    GameEvents.OFFER_DRAW_EVENT,
    GameEvents.GIVE_UP_EVENT,
    GameEvents.TIMEOUT_EVENT
  ] as const;

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.gameState?.currentValue) return;
    
    this.resetState();
    const newGameState = changes.gameState.currentValue as GameState;
    
    if (newGameState?.game_events?.length > 0) {
      this.processGameState();
    }
  }

  ngOnDestroy(): void {
    this.notationList = [];
    this.gameReturnEmitter.emit();
  }

  private resetState(): void {
    this.notationList = [];
    this.userEventChains = [];
    this.selectedMoveIndex = -1;
  }

  getMoveGroups(): { redMoves: (string | undefined)[]; blueMoves: (string | undefined)[] }[] {
    const groups: { redMoves: (string | undefined)[]; blueMoves: (string | undefined)[] }[] = [];
    
    for (let i = 0; i < this.notationList.length; i += 4) {
      groups.push({
        redMoves: [
          this.notationList[i],      // Red move 1
          this.notationList[i + 1]   // Red move 2
        ],
        blueMoves: [
          this.notationList[i + 2],  // Blue move 1
          this.notationList[i + 3]   // Blue move 2
        ]
      });
    }
    
    return groups;
  }

  isSelectedMove(moveIndex: number): boolean {
    return this.selectedMoveIndex === moveIndex;
  }

  private processGameState(): void {
    this.validGameState = cloneDeep(this.gameState);
    if (!this.validGameState) return;

    // Filter excluded events inline
    this.validGameState.user_events = this.filterEvents(this.validGameState.user_events);
    this.validGameState.game_events = this.filterEvents(this.validGameState.game_events);
    
    this.divideArrayOnUserEventChains();
    this.notationList = this.validGameState.user_events.map((_, i) => this.eventNotation(i));
  }

  private filterEvents<T extends { event_type: GameEvents }>(events: T[]): T[] {
    return events.filter(event => 
      !(this.EXCLUDED_EVENT_TYPES as readonly GameEvents[]).includes(event.event_type)
    );
  }

  buildEvent(gameEvents: GameEvent[], spectableHistory: boolean): void {
    this.gameLogEmitter.emit([gameEvents, spectableHistory]);
  }

  returnToCurrentEvent(): void {
    this.currentHistorySelection = -1;
    this.selectedMoveIndex = -1;
    this.gameReturnEmitter.emit();
  }

  onSelection(eventIndex: number): void {
    if (!this.validGameState || eventIndex >= this.notationList.length) return;

    this.selectedMoveIndex = eventIndex;

    if (eventIndex < this.currentHistorySelection) {
      this.currentHistorySelection = -1;
    }

    if (eventIndex === this.userEventChains.length - 1) {
      this.returnToCurrentEvent();
    } else {
      const selectedEvents = this.userEventChains.slice(0, eventIndex + 1).flat();
      this.gameLogEmitter.emit([selectedEvents, this.spectableHistory]);
    }
  }

  animatedHistorySelectionStep(): void {
    this.currentHistorySelection++;
    this.selectedMoveIndex = this.currentHistorySelection;
  }

  divideArrayOnUserEventChains(): void {
    this.validGameState?.user_events.forEach(() => {
      if (!this.validGameState) return;
      
      let userEventCount = 0;
      let iterator = 0;
      
      while (userEventCount < 2 && iterator < this.validGameState.game_events.length + 1) {
        if (this.isUserEvent(this.validGameState.game_events[iterator++])) {
          userEventCount++;
        }
      }
      
      this.userEventChains.push(this.validGameState.game_events.splice(0, iterator - 1));
    });
  }

  eventNotation(place: number): string {
    const eventChain = this.userEventChains[place];
    if (!eventChain?.length) return '?';

    const [primaryEvent] = eventChain;
    const teleportEvent = eventChain.find(e => e.event_type === GameEvents.TELEPORT_EVENT);
    const captureEvent = eventChain.find(e => e.event_type === GameEvents.PIECE_TAKEN_EVENT);

    if (teleportEvent && primaryEvent.event_type === GameEvents.PIECE_MOVED_EVENT) {
      return this.createMoveNotation(primaryEvent as PieceMovedEvent, teleportEvent as TeleportEvent);
    }

    if (captureEvent && primaryEvent.event_type === GameEvents.PIECE_MOVED_EVENT) {
      return this.createMoveNotation(primaryEvent as PieceMovedEvent, undefined, true);
    }

    switch (primaryEvent.event_type) {
      case GameEvents.LASER_SHOT_EVENT:
        return 'L';
      case GameEvents.PIECE_MOVED_EVENT:
        return this.createMoveNotation(primaryEvent as PieceMovedEvent);
      case GameEvents.PIECE_ROTATED_EVENT:
        const rotation = primaryEvent as PieceRotatedEvent;
        return `${this.formatCoords(rotation.rotated_piece_at)}↻${rotation.rotation}°`;
      default:
        return '?';
    }
  }

  private createMoveNotation(
    moveEvent: PieceMovedEvent, 
    teleportEvent?: TeleportEvent, 
    isCapture = false
  ): string {
    const from = this.formatCoords(moveEvent.moved_from);
    const to = this.formatCoords(moveEvent.moved_to);
    const connector = isCapture ? 'x' : '-';
    const base = `${from}${connector}${to}`;
    
    return teleportEvent 
      ? `${base}(${this.formatCoords(teleportEvent.teleported_to)})`
      : base;
  }

  private formatCoords({ x, y }: Coordinates): string {
    return `${x}${y}`;
  }

  giveUp = (): void => this.giveUpEmitter.emit();
  draw = (): void => this.drawEmitter.emit();

  isUserEvent(gameEvent?: GameEvent): boolean {
    return gameEvent ? 
      (this.USER_EVENT_TYPES as readonly GameEvents[]).includes(gameEvent.event_type) : 
      false;
  }
}

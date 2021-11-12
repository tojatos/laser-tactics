import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameComponent } from './game.component';
import { BoardComponent } from './components/board/board.component';
import { ChatComponent } from './components/chat/chat.component';
import { Board } from './src/board';
import { Resources } from './src/Display/Resources';
import { EventsExecutor } from './src/eventsExecutor';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Game } from './src/Game';
import { Animations } from './src/Display/Animations';
import { Drawings } from './src/Display/Drawings';
import { GameServiceInterceptor } from './services/game-service.interceptor';
import { MaterialModule } from '../material/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BoardActionsComponent } from './components/board-actions/board-actions.component';
import { BoardLogComponent } from './components/board-log/board-log.component';

@NgModule({
  declarations: [GameComponent, BoardComponent, BoardActionsComponent, ChatComponent, BoardActionsComponent, BoardLogComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    MaterialModule,
    FlexLayoutModule
  ],
  exports: [GameComponent],
  providers: [Game, Board, Drawings, Animations, Resources, EventsExecutor, { provide: HTTP_INTERCEPTORS, useClass: GameServiceInterceptor, multi: true }]
})
export class GameModule { }

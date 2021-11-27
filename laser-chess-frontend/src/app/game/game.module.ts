import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameComponent } from './game.component';
import { BoardComponent } from './components/board/board.component';
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
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from '../app-routing.module';

@NgModule({
  declarations: [GameComponent, BoardComponent, BoardActionsComponent, BoardActionsComponent, BoardLogComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    MaterialModule,
    FlexLayoutModule,
    FormsModule,
    AppRoutingModule
  ],
  exports: [GameComponent],
  providers: [Game, Board, Drawings, Animations, Resources, EventsExecutor, { provide: HTTP_INTERCEPTORS, useClass: GameServiceInterceptor, multi: true }]
})
export class GameModule { }

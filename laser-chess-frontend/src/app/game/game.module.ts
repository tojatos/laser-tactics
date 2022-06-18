import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameComponent } from './game.component';
import { BoardComponent } from './components/board/board.component';
import { Board } from './src/GameStateData/Board';
import { Resources } from './src/Display/Resources';
import { EventsExecutor } from './src/Controller/EventsExecutor';
import { HttpClientModule } from '@angular/common/http';
import { Game } from './src/Controller/Game';
import { Animations } from './src/Display/Animations';
import { Drawings } from './src/Display/Drawings';
import { MaterialModule } from '../material/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BoardActionsComponent } from './components/board-actions/board-actions.component';
import { BoardLogComponent } from './components/board-log/board-log.component';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from '../app-routing.module';
import { ClockComponent } from './components/clock/clock.component';
import { ChatComponent } from './components/chat/chat.component';

@NgModule({
  declarations: [GameComponent, BoardComponent, BoardActionsComponent, BoardActionsComponent, BoardLogComponent, ClockComponent, ChatComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    MaterialModule,
    FlexLayoutModule,
    FormsModule,
    AppRoutingModule
  ],
  exports: [GameComponent],
  providers: [Game, Board, Drawings, Animations, Resources, EventsExecutor]
})
export class GameModule { }

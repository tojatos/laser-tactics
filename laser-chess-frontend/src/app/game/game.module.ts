import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameComponent } from './game.component';
import { BoardComponent } from './components/board/board.component';
import { ChatComponent } from './components/chat/chat.component';
import { Board } from './src/board';
import { Resources } from './src/Display/Resources';
import { EventsExecutor } from './src/eventsExecutor';
import { HttpClientModule } from '@angular/common/http';
import { Game } from './src/Game';
import { Animations } from './src/Display/Animations';
import { Drawings } from './src/Display/Drawings';

@NgModule({
  declarations: [GameComponent, BoardComponent, ChatComponent],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  exports: [GameComponent],
  providers: [Game, Board, Drawings, Animations, Resources, EventsExecutor]
})
export class GameModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameComponent } from './game.component';
import { BoardComponent } from './components/board/board.component';
import { ChatComponent } from './components/chat/chat.component';
import { Canvas } from './src/Canvas/Canvas';
import { Board } from './src/board';
import { Resources } from './src/Canvas/Resources';
import { EventsExecutor } from './src/eventsExecutor';



@NgModule({
  declarations: [GameComponent, BoardComponent, ChatComponent],
  imports: [
    CommonModule
  ],
  exports: [GameComponent],
  providers: [Canvas, Board, Resources, EventsExecutor]
})
export class GameModule { }

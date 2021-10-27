import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameComponent } from './game.component';
import { BoardComponent } from './components/board/board.component';
import { ChatComponent } from './components/chat/chat.component';
import { GameCanvas } from './src/Display/Canvas/GameCanvas';
import { Board } from './src/board';
import { Resources } from './src/Display/Resources';
import { EventsExecutor } from './src/eventsExecutor';
import { HttpClientModule } from '@angular/common/http';
import { GUICanvas } from './src/Display/Canvas/GUICanvas';

@NgModule({
  declarations: [GameComponent, BoardComponent, ChatComponent],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  exports: [GameComponent],
  providers: [GameCanvas, GUICanvas, Board, Resources, EventsExecutor]
})
export class GameModule { }

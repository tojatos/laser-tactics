import { Component, ElementRef, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { ChatMessage } from '../../game.models';
import { ChatWebsocketService } from '../../services/chat.service';
import { EventEmitterService } from '../../services/event-emitter.service';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class ChatComponent {
  @ViewChild('msg')
  myScrollContainer: ElementRef | undefined;

  @Input() myUsername: string | undefined;
  messages: Array<ChatMessage> = [];
  message = '';
  gameId = '';

  constructor(
    private eventEmitter: EventEmitterService,
    private chatService: ChatWebsocketService
  ) {
    this.eventEmitter.subsChat.asObservable().subscribe((chatMessages) => {
      this.setChat(<Array<ChatMessage>>chatMessages);
    });
  }

  setWebsocketConnection(gameId: string) {
    this.chatService.connect(gameId);
    this.gameId = gameId;
  }

  setChat(messages: Array<ChatMessage>) {
    this.messages = messages;
    this.scrollDownToBottom();
  }

  scrollDownToBottom() {
    setTimeout(() => {
      if (this.myScrollContainer?.nativeElement) {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
      }
    }, 10);
  }

  isMyMessage(msg: ChatMessage) {
    return msg.username == this.myUsername;
  }

  sendMessage() {
    if (this.myUsername && this.message?.trim()) {
      this.messages.push({
        username: this.myUsername,
        payload: this.message.trim(),
      });
      this.chatService.sendMessage(this.gameId, this.message.trim());
      this.message = '';
      this.scrollDownToBottom();
    }
  }

  // Track function for messages to avoid recreation of DOM elements
  trackMessage(index: number, msg: any): number {
    return index;
  }
}

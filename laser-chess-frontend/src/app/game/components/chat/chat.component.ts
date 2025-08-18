import { Component, ElementRef, Input, ViewChild, ViewEncapsulation, inject } from '@angular/core';
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
  private eventEmitter = inject(EventEmitterService);
  private chatService = inject(ChatWebsocketService);

  @ViewChild('msg')
  myScrollContainer: ElementRef | undefined;

  @Input() myUsername: string | undefined;
  messages: Array<ChatMessage> = [];
  message = '';
  gameId = '';

  constructor() {
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
      const element = this.myScrollContainer?.nativeElement as HTMLElement;
      if (element) {
        element.scrollTop = element.scrollHeight;
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
  trackMessage(msg: ChatMessage): any {
    return msg.username + '_' + msg.payload; // Use a unique identifier
  }
}

import { Component, ElementRef, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { ChatMessage } from '../../game.models';
import { ChatWebsocketService } from '../../services/chat.service';
import { EventEmitterService } from '../../services/event-emitter.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  encapsulation : ViewEncapsulation.None,
})
export class ChatComponent {

  @ViewChild('msg')
  myScrollContainer: ElementRef<Window> | undefined

  @Input() myUsername: string | undefined
  messages: Array<ChatMessage> = []
  message = ""
  unreadMessages = -1;
  gameId = ""

  constructor(private eventEmitter: EventEmitterService, private chatService: ChatWebsocketService) {
    this.eventEmitter.subsChat.asObservable().subscribe(chatMessages => {
      this.setChat(<Array<ChatMessage>>chatMessages)
    })
  }

  setWebsocketConnection(gameId: string){
    this.chatService.connect(gameId)
    this.gameId = gameId
  }

  isOpened = false;

  setChat(messages: Array<ChatMessage>) {
    if(!this.isOpened)
      this.unreadMessages++
    this.messages = messages
  }

  scrollDownToBottom() {
    setTimeout(() => {
      this.myScrollContainer?.nativeElement.scrollTo(0, 1000)
    }, 10)
  }

  openChat() {
    this.unreadMessages = 0;
    this.isOpened = true;
    this.scrollDownToBottom()
  }

  isMyMessage(msg: ChatMessage){
    return msg.username == this.myUsername;
  }

  sendMessage(){
    if(this.myUsername && this.message){
      this.messages.push({
        username: this.myUsername,
        payload: this.message
      })
      this.chatService.sendMessage(this.gameId, this.message)
      this.message = ""
      this.scrollDownToBottom()
    }
  }

}

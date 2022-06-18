import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

type Message = {
  from: string,
  content: string
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  encapsulation : ViewEncapsulation.None,
})
export class ChatComponent implements OnInit {

  @Input() myUsername: string | undefined
  messages: Array<Message> = []
  message = ""
  readMessages = 0;

  ngOnInit() {

  //load from server, also some rxjs
  this.messages = [
      {
        from: "string",
        content: "Hello my friend"
      },
      {
        from: "string2",
        content: "Hello"
      },
      {
        from: "string2",
        content: "Hello"
      },
      {
        from: "string2",
        content: "Hello"
      },
    ]
  }

  isOpened = false;

  isMyMessage(msg: Message){
    return msg.from == this.myUsername;
  }

  sendMessage(){
    if(this.myUsername){
      this.messages.push({
        from: this.myUsername,
        content: this.message
      })
      this.message = ""
      // send to rxjs
    }
  }

}

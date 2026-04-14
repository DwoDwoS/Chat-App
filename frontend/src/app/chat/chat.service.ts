import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface ChatMessage {
  username: string;
  text: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private socket!: WebSocket;
  private messagesSubject = new Subject<ChatMessage>();

  messages$: Observable<ChatMessage> = this.messagesSubject.asObservable();

  connect() {
    this.socket = new WebSocket('ws://localhost:8000/ws');

    this.socket.onmessage = (event) => {
      const message: ChatMessage = JSON.parse(event.data);
      this.messagesSubject.next(message);
    };

    this.socket.onclose = () => {
      console.log('WebSocket fermé');
    };
  }

  send(username: string, text: string) {
    const message: ChatMessage = { username, text };
    this.socket.send(JSON.stringify(message));
  }

  disconnect() {
    this.socket?.close();
  }
}
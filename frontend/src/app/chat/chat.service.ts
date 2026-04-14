import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private socket!: WebSocket;
  private messagesSubject = new Subject<string>();

  messages$: Observable<string> = this.messagesSubject.asObservable();

  connect() {
    this.socket = new WebSocket('ws://localhost:8000/ws');

    this.socket.onmessage = (event) => {
      this.messagesSubject.next(event.data);
    };

    this.socket.onclose = () => {
      console.log('WebSocket fermé');
    };
  }

  send(text: string) {
    this.socket.send(text);
  }

  disconnect() {
    this.socket?.close();
  }
}
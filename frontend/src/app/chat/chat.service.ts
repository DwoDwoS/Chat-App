import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface ChatMessage {
  username: string;
  text: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = 'http://localhost:8000';
  private socket!: WebSocket;

  constructor(private http: HttpClient) {}
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

  askAi(question: string): Observable<{ answer: string }> {
    return this.http.post<{ answer: string }>(`${this.apiUrl}/api/ai`, { question });
  }

  disconnect() {
    this.socket?.close();
  }
}
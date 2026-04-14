import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatService, ChatMessage } from './chat.service';

@Component({
  selector: 'app-chat',
  imports: [FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat implements OnInit, OnDestroy {
  messages = signal<ChatMessage[]>([]);
  draft = '';
  username = '';
  joined = false;
  private subscription!: Subscription;

  constructor(private chatService: ChatService) {}

  ngOnInit() {}

  join() {
    const name = this.username.trim();
    if (!name) return;
    this.joined = true;
    this.chatService.connect();
    this.subscription = this.chatService.messages$.subscribe((msg) => {
      this.messages.update((list) => [...list, msg]);
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    this.chatService.disconnect();
  }

  send() {
    const text = this.draft.trim();
    if (!text) return;
    this.chatService.send(this.username, text);
    this.draft = '';
  }
}

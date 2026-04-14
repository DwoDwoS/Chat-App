import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatService } from './chat.service';

@Component({
  selector: 'app-chat',
  imports: [FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat implements OnInit, OnDestroy {
  messages = signal<string[]>([]);
  draft = '';
  private subscription!: Subscription;

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.chatService.connect();
    this.subscription = this.chatService.messages$.subscribe((msg) => {
      this.messages.update((list) => [...list, msg]);
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.chatService.disconnect();
  }

  send() {
    const text = this.draft.trim();
    if (!text) return;
    this.chatService.send(text);
    this.draft = '';
  }
}
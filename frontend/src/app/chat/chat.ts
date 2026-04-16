import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatService, ChatMessage } from './chat.service';

export interface AiMessage {
  role: 'user' | 'assistant';
  text: string;
  created_at: string;
}

@Component({
  selector: 'app-chat',
  imports: [FormsModule, DatePipe],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat implements OnInit, OnDestroy {
  messages = signal<ChatMessage[]>([]);
  aiMessages = signal<AiMessage[]>([]);
  draft = '';
  username = '';
  joined = false;
  activeTab: 'chat' | 'ai' = 'chat';
  aiQuestion = '';
  aiLoading = false;
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

  askAi() {
    const question = this.aiQuestion.trim();
    if (!question || this.aiLoading) return;

    this.aiMessages.update((list) => [
      ...list,
      { role: 'user', text: question, created_at: new Date().toISOString() },
    ]);
    this.aiQuestion = '';
    this.aiLoading = true;

    this.chatService.askAi(question).subscribe({
      next: (res) => {
        this.aiMessages.update((list) => [
          ...list,
          { role: 'assistant', text: res.answer, created_at: new Date().toISOString() },
        ]);
        this.aiLoading = false;
      },
      error: () => {
        this.aiMessages.update((list) => [
          ...list,
          { role: 'assistant', text: "Désolé, je n'ai pas pu répondre. Réessaie plus tard.", created_at: new Date().toISOString() },
        ]);
        this.aiLoading = false;
      },
    });
  }
}

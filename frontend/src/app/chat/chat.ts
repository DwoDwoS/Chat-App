import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  imports: [FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat {
  messages = signal<string[]>([]);
  draft = '';

  send() {
    const text = this.draft.trim();
    if (!text) return;
    this.messages.update((list) => [...list, text]);
    this.draft = '';
  }
}

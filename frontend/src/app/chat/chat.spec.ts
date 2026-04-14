import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Chat } from './chat';
import { ChatService } from './chat.service';

const mockChatService = {
  messages$: { subscribe: () => ({ unsubscribe: () => {} }) },
  connect: () => {},
  disconnect: () => {},
  send: () => {},
};

describe('Chat', () => {
  let component: Chat;
  let fixture: ComponentFixture<Chat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chat],
      providers: [
        { provide: ChatService, useValue: mockChatService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Chat);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
import { create } from 'zustand';

export interface ChatbotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatbotState {
  messages: ChatbotMessage[];
  isOpen: boolean;
  isLoading: boolean;

  addMessage: (message: ChatbotMessage) => void;
  setAssistantMessage: (id: string, content: string) => void;
  toggleOpen: () => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
}

export const useChatbotStore = create<ChatbotState>((set) => ({
  messages: [],
  isOpen: false,
  isLoading: false,

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setAssistantMessage: (id, content) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, content } : msg
      ),
    })),

  toggleOpen: () =>
    set((state) => ({ isOpen: !state.isOpen })),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  clearMessages: () =>
    set({ messages: [] }),
}));

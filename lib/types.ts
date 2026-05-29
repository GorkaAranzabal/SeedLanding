// Shared client-side types for the /create builder. Shaped as a self-contained
// Project so a real backend/DB (Supabase etc.) can persist it later without
// reshaping the UI.

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface Project {
  prompt: string;
  styleImageUrl: string | null;
  messages: ChatMessage[];
  code: string;
}

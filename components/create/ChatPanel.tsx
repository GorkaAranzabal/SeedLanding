'use client';

import { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '@/lib/types';

interface ChatPanelProps {
  prompt: string;
  messages: ChatMessage[];
  streamingText: string; // assistant text mid-stream (empty when idle)
  building: boolean;
  runtimeError: string | null;
  onSend: (text: string) => void;
  onFixError: () => void;
}

export default function ChatPanel({
  prompt,
  messages,
  streamingText,
  building,
  runtimeError,
  onSend,
  onFixError,
}: ChatPanelProps) {
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the conversation pinned to the latest message / token.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, streamingText, building]);

  function submit() {
    const text = draft.trim();
    if (!text || building) return;
    onSend(text);
    setDraft('');
  }

  return (
    <div className="flex flex-col h-full bg-black border-r border-white/10">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 h-14 border-b border-white/10 shrink-0">
        <span className="w-2 h-2 bg-seed-green rounded-full animate-pulse" />
        <span className="font-space text-xs tracking-[0.2em] text-seed-white truncate">
          {prompt.toUpperCase()}
        </span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6 space-y-5">
        {messages.map((m, i) => (
          <Bubble key={i} role={m.role} content={m.content} />
        ))}

        {building && streamingText && <Bubble role="assistant" content={streamingText} />}
        {building && !streamingText && (
          <div className="flex items-center gap-2 text-seed-platinum font-space text-xs tracking-[0.2em]">
            <span className="w-1.5 h-1.5 bg-seed-green rounded-full animate-bounce" />
            THINKING…
          </div>
        )}

        {runtimeError && !building && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 space-y-2">
            <p className="font-space text-[10px] tracking-[0.2em] text-red-400">RUNTIME ERROR</p>
            <pre className="text-[11px] text-red-300/90 whitespace-pre-wrap break-words max-h-32 overflow-y-auto font-mono">
              {runtimeError}
            </pre>
            <button
              onClick={onFixError}
              className="font-space text-[10px] tracking-[0.2em] text-seed-white hover:text-seed-green transition-colors"
            >
              ⚙ FIX IT AUTOMATICALLY
            </button>
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="p-4 border-t border-white/10 shrink-0">
        <div className="relative group">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl transition-all duration-300 group-focus-within:border-seed-green/50 group-focus-within:shadow-[0_0_20px_rgba(68,204,68,0.15)]" />
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={building ? 'Building…' : 'Describe a change… (e.g. add patrolling enemies)'}
            disabled={building}
            rows={2}
            className="relative z-10 w-full bg-transparent resize-none px-4 py-3 pr-14 text-sm text-seed-white placeholder:text-seed-platinum/60 focus:outline-none font-rajdhani disabled:opacity-50"
          />
          <button
            onClick={submit}
            disabled={building || !draft.trim()}
            className="absolute z-10 right-2 bottom-2 w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/20 text-seed-white hover:text-seed-green hover:border-seed-green/50 transition-colors disabled:opacity-30 disabled:hover:text-seed-white"
            aria-label="Send"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}

function Bubble({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed font-rajdhani ${
          isUser
            ? 'bg-seed-green/15 border border-seed-green/30 text-seed-white'
            : 'bg-white/5 border border-white/10 text-seed-silver'
        }`}
      >
        {content}
      </div>
    </div>
  );
}

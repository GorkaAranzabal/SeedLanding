'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import ChatPanel from './ChatPanel';
import GamePreview from './GamePreview';
import { extractCode, extractMessage } from '@/lib/agentPrompt';
import type { ChatMessage } from '@/lib/types';

interface BuilderLayoutProps {
  prompt: string;
  styleImageUrl: string | null;
}

export default function BuilderLayout({ prompt, styleImageUrl }: BuilderLayoutProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [code, setCode] = useState('');
  const [building, setBuilding] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  // Latest code without re-creating callbacks on every keystroke of the stream.
  const codeRef = useRef('');
  codeRef.current = code;
  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = messages;

  const runAgent = useCallback(
    async (userRequest: string, opts: { firstBuild?: boolean; showUserBubble?: boolean } = {}) => {
      if (opts.showUserBubble) {
        setMessages((prev) => [...prev, { role: 'user', content: userRequest }]);
      }
      setBuilding(true);
      setStreamingText('');
      setRuntimeError(null);

      // History = conversation prior to this turn (excludes the bubble just added,
      // since the request itself is sent separately as userRequest).
      const history = messagesRef.current;

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            styleImageUrl,
            currentCode: codeRef.current || null,
            history,
            userRequest,
          }),
        });

        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || `Request failed (${res.status})`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let full = '';
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
          // Show only the prose as it streams; hide the code block.
          setStreamingText(extractMessage(full));
        }

        const newCode = extractCode(full);
        if (newCode) setCode(newCode);
        setMessages((prev) => [...prev, { role: 'assistant', content: extractMessage(full) }]);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Something went wrong.';
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `⚠ ${msg}` },
        ]);
      } finally {
        setBuilding(false);
        setStreamingText('');
      }
    },
    [prompt, styleImageUrl],
  );

  // Kick off the first build exactly once.
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    runAgent('', { firstBuild: true, showUserBubble: false });
  }, [runAgent]);

  const handleSend = useCallback(
    (text: string) => {
      runAgent(text, { showUserBubble: true });
    },
    [runAgent],
  );

  const handleFixError = useCallback(() => {
    if (!runtimeError) return;
    const errText = runtimeError;
    setRuntimeError(null);
    runAgent(
      `The game threw this runtime error — please fix it and return the full corrected module:\n\n${errText}`,
      { showUserBubble: true },
    );
  }, [runtimeError, runAgent]);

  const handleRuntimeError = useCallback((message: string) => {
    // Ignore stale errors that arrive while a rebuild is in flight.
    setRuntimeError(message);
  }, []);

  return (
    <div className="w-full h-screen flex overflow-hidden bg-black">
      <div className="w-full md:w-[38%] max-w-[520px] h-full shrink-0">
        <ChatPanel
          prompt={prompt}
          messages={messages}
          streamingText={streamingText}
          building={building}
          runtimeError={runtimeError}
          onSend={handleSend}
          onFixError={handleFixError}
        />
      </div>
      <div className="hidden md:block flex-1 h-full">
        <GamePreview code={code} building={building} onRuntimeError={handleRuntimeError} />
      </div>
    </div>
  );
}

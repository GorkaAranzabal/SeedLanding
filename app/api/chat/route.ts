import { NextRequest, NextResponse } from 'next/server';
import { streamChat, sseToTextStream, type ChatMessage } from '@/lib/openrouter';
import { buildSystemPrompt, buildUserMessage, type BuildContext } from '@/lib/agentPrompt';

export const runtime = 'nodejs';
export const maxDuration = 120;

interface ChatRequestBody {
  prompt: string;
  styleImageUrl: string | null;
  currentCode: string | null;
  // Prior turns of human-readable conversation (assistant prose only, no code).
  history: { role: 'user' | 'assistant'; content: string }[];
  // The new user request driving this turn.
  userRequest: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatRequestBody;
    const ctx: BuildContext = {
      prompt: body.prompt ?? '',
      styleImageUrl: body.styleImageUrl ?? null,
      currentCode: body.currentCode ?? null,
    };

    const messages: ChatMessage[] = [
      { role: 'system', content: buildSystemPrompt(ctx) },
    ];

    // Replay prior human-readable turns so the model keeps conversational
    // context. The current code is supplied fresh in the final user message, so
    // we don't bloat history with old code blocks.
    for (const m of body.history ?? []) {
      messages.push({ role: m.role, content: m.content });
    }

    messages.push({ role: 'user', content: buildUserMessage(ctx, body.userRequest ?? '') });

    const upstream = await streamChat(messages);
    const textStream = sseToTextStream(upstream);

    return new Response(textStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Chat request failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

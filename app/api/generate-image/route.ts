import { NextRequest, NextResponse } from 'next/server';
import { generateImage, type AspectRatio } from '@/lib/kie';

export const runtime = 'nodejs';
export const maxDuration = 120; // Nano Banana 2 can take ~30-60s; poll headroom.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const prompt: string = (body?.prompt ?? '').toString().trim();
    if (!prompt) {
      return NextResponse.json({ error: 'A prompt is required.' }, { status: 400 });
    }
    const aspectRatio: AspectRatio = body?.aspectRatio ?? '16:9';

    const imageUrl = await generateImage({ prompt, aspectRatio });
    return NextResponse.json({ imageUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Image generation failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

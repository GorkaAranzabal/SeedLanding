// Nano Banana 2 (kie.ai) image generation client.
//
// kie.ai uses an async "jobs" API: you POST a task to createTask, get a taskId
// back, then poll recordInfo until the task reaches a terminal state. The exact
// field names in the recordInfo response are not fully documented, so the result
// parsing below is intentionally defensive (parse resultJson, then fall back to
// scanning the payload for any http(s) image URL).

const KIE_BASE = 'https://api.kie.ai/api/v1/jobs';
const NANO_BANANA_MODEL = 'nano-banana-2';

export type AspectRatio =
  | '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '4:5' | '5:4' | '9:16' | '16:9' | '21:9' | 'auto';

export interface GenerateImageOptions {
  prompt: string;
  aspectRatio?: AspectRatio;
  resolution?: '1K' | '2K' | '4K';
}

function authHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
}

async function createTask(apiKey: string, opts: GenerateImageOptions): Promise<string> {
  const res = await fetch(`${KIE_BASE}/createTask`, {
    method: 'POST',
    headers: authHeaders(apiKey),
    body: JSON.stringify({
      model: NANO_BANANA_MODEL,
      input: {
        prompt: opts.prompt,
        aspect_ratio: opts.aspectRatio ?? '16:9',
        resolution: opts.resolution ?? '2K',
        output_format: 'png',
      },
    }),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok || !json) {
    throw new Error(`kie createTask failed (${res.status}): ${JSON.stringify(json)}`);
  }
  const taskId: string | undefined = json?.data?.taskId ?? json?.data?.task_id ?? json?.taskId;
  if (!taskId) {
    throw new Error(`kie createTask returned no taskId: ${JSON.stringify(json)}`);
  }
  return taskId;
}

// Recursively walk an object/string looking for the first http(s) URL that
// points at an image. Used as a fallback when the documented field shape moves.
function findImageUrl(value: unknown): string | null {
  if (typeof value === 'string') {
    // Maybe it's a JSON-encoded blob (resultJson is a stringified object).
    const trimmed = value.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        return findImageUrl(JSON.parse(trimmed));
      } catch {
        /* not JSON, fall through */
      }
    }
    if (/^https?:\/\/\S+\.(png|jpe?g|webp)(\?\S*)?$/i.test(trimmed)) return trimmed;
    if (/^https?:\/\//i.test(trimmed) && /(image|result|kie|tempfile|file)/i.test(trimmed)) {
      return trimmed;
    }
    return null;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findImageUrl(item);
      if (found) return found;
    }
    return null;
  }
  if (value && typeof value === 'object') {
    // Prefer obvious result keys first.
    const obj = value as Record<string, unknown>;
    for (const key of ['resultUrls', 'resultUrl', 'imageUrl', 'imageUrls', 'url', 'urls']) {
      if (key in obj) {
        const found = findImageUrl(obj[key]);
        if (found) return found;
      }
    }
    for (const v of Object.values(obj)) {
      const found = findImageUrl(v);
      if (found) return found;
    }
  }
  return null;
}

type TaskState = 'waiting' | 'queuing' | 'generating' | 'success' | 'fail' | string;

async function pollTask(apiKey: string, taskId: string): Promise<string> {
  const TIMEOUT_MS = 120_000;
  const INTERVAL_MS = 2_500;
  const start = Date.now();

  while (Date.now() - start < TIMEOUT_MS) {
    const res = await fetch(`${KIE_BASE}/recordInfo?taskId=${encodeURIComponent(taskId)}`, {
      headers: authHeaders(apiKey),
    });
    const json = await res.json().catch(() => null);
    if (json) {
      const data = json.data ?? json;
      const state: TaskState = (data?.state ?? data?.status ?? '').toString().toLowerCase();

      if (state === 'success' || state === 'succeeded' || state === 'completed') {
        const url = findImageUrl(data);
        if (url) return url;
        throw new Error(`kie task succeeded but no image URL found: ${JSON.stringify(data)}`);
      }
      if (state === 'fail' || state === 'failed' || state === 'error') {
        const msg = data?.failMsg ?? data?.failReason ?? data?.msg ?? 'unknown error';
        throw new Error(`kie task failed: ${msg}`);
      }
      // Some responses omit an explicit state but already carry a result.
      if (!state) {
        const url = findImageUrl(data);
        if (url) return url;
      }
    }
    await new Promise((r) => setTimeout(r, INTERVAL_MS));
  }
  throw new Error('kie task timed out');
}

export async function generateImage(opts: GenerateImageOptions): Promise<string> {
  const apiKey = process.env.KIE_API_KEY;
  if (!apiKey) {
    throw new Error('KIE_API_KEY is not set. Add it to .env.local.');
  }
  const taskId = await createTask(apiKey, opts);
  return pollTask(apiKey, taskId);
}

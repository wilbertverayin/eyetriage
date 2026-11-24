/**
 * Minimal client for the Gemini Interactions API.
 * generateContent (used by Genkit 1.x) is legacy and returns 404 for new keys,
 * so we call /v1beta/interactions directly.
 */

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/interactions';

// Tried in order; the next one is used when a model is overloaded (503) or unavailable (404).
const MODELS = (
  process.env.GEMINI_MODELS ||
  'gemini-3.5-flash,gemini-3.8-flash,gemini-3.7-flash,gemini-3.6-flash,gemini-3.1-flash-lite'
)
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);

export type InputPart = { type: 'text'; text: string } | { type: 'image'; mime_type: string; data: string };

export function getApiKey(): string | undefined {
  return process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
}

/** Splits a `data:<mime>;base64,<data>` URI into an image input part. */
export function imagePartFromDataUri(dataUri: string): InputPart {
  const match = /^data:([^;]+);base64,([\s\S]+)$/.exec(dataUri);
  if (!match) throw new Error("Invalid image data URI. Expected 'data:<mimetype>;base64,<data>'.");
  return { type: 'image', mime_type: match[1], data: match[2] };
}

interface InteractionResponse {
  status?: string;
  steps?: { type: string; content?: { type: string; text?: string }[] }[];
  error?: { message?: string; code?: string };
}

function outputText(res: InteractionResponse): string {
  return (res.steps ?? [])
    .filter((s) => s.type === 'model_output')
    .flatMap((s) => s.content ?? [])
    .map((c) => c.text ?? '')
    .join('')
    .trim();
}

/** Sends the input to Gemini and parses the reply as JSON matching `schema`. */
export async function generateJson<T>(input: InputPart[], schema: object): Promise<T> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('GOOGLE_GENAI_API_KEY is not set.');

  let lastError = 'No Gemini model configured.';
  // Free-tier models are often briefly overloaded; go through the list twice with a pause.
  for (let round = 0; round < 2; round++) {
    if (round > 0) await new Promise((r) => setTimeout(r, 4000));
    for (const model of MODELS) {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
          'Api-Revision': '2026-05-20',
        },
        body: JSON.stringify({
          model,
          input,
          response_format: {
            type: 'text',
            mime_type: 'application/json',
            schema,
          },
        }),
        cache: 'no-store',
      });

      const body = (await res.json().catch(() => ({}))) as InteractionResponse;
      if (!res.ok) {
        lastError = `${model}: HTTP ${res.status} ${body.error?.message ?? ''}`.trim();
        if (res.status === 503 || res.status === 404 || res.status === 429) {
          console.warn(`Gemini ${lastError}; trying next model.`);
          continue;
        }
        throw new Error(lastError);
      }

      const text = outputText(body);
      if (!text) throw new Error(`${model} returned no output (status: ${body.status ?? 'unknown'}).`);
      try {
        return JSON.parse(text) as T;
      } catch {
        throw new Error(`${model} returned output that is not valid JSON.`);
      }
    }
  }
  throw new Error(`All Gemini models are busy or unavailable. Last error: ${lastError}`);
}

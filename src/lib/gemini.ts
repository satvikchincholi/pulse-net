// src/lib/gemini.ts
import fetch from 'node-fetch';

/**
 * Sends an image to Gemini‑1.5‑flash for AI‑generated detection.
 * Returns `{ is_ai_generated: boolean; reason: string }`.
 */
export async function checkImageAiGenerated(file: File): Promise<{ is_ai_generated: boolean; reason: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { mimeType: file.type, data: base64 } },
              { text: 'Analyze this image. Is it a real, raw photograph of a physical location, or is it an AI‑generated image/deepfake? Return JSON: { "is_ai_generated": boolean, "reason": string }.' },
            ],
          },
        ],
      }),
    },
  );

  const json = (await response.json()) as any;
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  try {
    const parsed = JSON.parse(text);
    return { is_ai_generated: Boolean(parsed.is_ai_generated), reason: parsed.reason ?? '' };
  } catch (e) {
    // fallback – simple string check
    const lowered = text.toLowerCase();
    const is_ai = lowered.includes('yes') || lowered.includes('true');
    return { is_ai_generated: is_ai, reason: text };
  }
}

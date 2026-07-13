import Anthropic from '@anthropic-ai/sdk';
import { REPAIR_ANALYSIS_PROMPT } from '../prompts.js';

/**
 * Analyze a property photo using Claude (claude-sonnet-4-5).
 * @param {string} base64Image - Base64-encoded image (no data URI prefix)
 * @param {string} mimeType - e.g. "image/jpeg"
 * @returns {Promise<Object>} Structured repair analysis
 */
export async function analyzeWithAnthropic(base64Image, mimeType = 'image/jpeg') {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not set in .env.local');
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1500,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType,
              data: base64Image,
            },
          },
          {
            type: 'text',
            text: REPAIR_ANALYSIS_PROMPT,
          },
        ],
      },
    ],
  });

  const text = response.content[0].text;
  return parseJSON(text);
}

function parseJSON(text) {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    return JSON.parse(match ? match[0] : text);
  } catch {
    throw new Error('Anthropic returned invalid JSON: ' + text);
  }
}

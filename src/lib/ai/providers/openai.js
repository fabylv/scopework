import OpenAI from 'openai';
import { REPAIR_ANALYSIS_PROMPT } from '../prompts.js';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Analyze a property photo using GPT-4o Vision.
 * @param {string} base64Image - Base64-encoded image (no data URI prefix)
 * @param {string} mimeType - e.g. "image/jpeg"
 * @returns {Promise<Object>} Structured repair analysis
 */
export async function analyzeWithOpenAI(base64Image, mimeType = 'image/jpeg') {
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 1500,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`,
              detail: 'high',
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

  const text = response.choices[0].message.content;
  return parseJSON(text);
}

function parseJSON(text) {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    return JSON.parse(match ? match[0] : text);
  } catch {
    throw new Error('OpenAI returned invalid JSON: ' + text);
  }
}

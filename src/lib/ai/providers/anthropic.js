import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { REPAIR_ANALYSIS_PROMPT, parseJSON } from '../prompts.js';

/**
 * Analyze a property photo using Claude Vision.
 * @param {string} base64Image - Base64-encoded image (no data URI prefix)
 * @param {string} mimeType - e.g. "image/jpeg"
 * @returns {Promise<Object>} Structured repair analysis
 */
export async function analyzeWithAnthropic(base64Image, mimeType = 'image/jpeg') {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not set in .env.local');

  const { text } = await generateText({
    model: anthropic('claude-opus-4-5'),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            image: `data:${mimeType};base64,${base64Image}`,
          },
          { type: 'text', text: REPAIR_ANALYSIS_PROMPT },
        ],
      },
    ],
    maxTokens: 1500,
  });

  return parseJSON(text, 'Anthropic');
}

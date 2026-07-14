import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { REPAIR_ANALYSIS_PROMPT, parseJSON } from '../prompts.js';

/**
 * Analyze a property photo using GPT-4o Vision.
 * @param {string} base64Image - Base64-encoded image (no data URI prefix)
 * @param {string} mimeType - e.g. "image/jpeg"
 * @returns {Promise<Object>} Structured repair analysis
 */
export async function analyzeWithOpenAI(base64Image, mimeType = 'image/jpeg') {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not set in .env.local');

  const { text } = await generateText({
    model: openai('gpt-4o'),
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

  return parseJSON(text, 'OpenAI');
}

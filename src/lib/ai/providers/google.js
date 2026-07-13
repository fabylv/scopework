import { GoogleGenerativeAI } from '@google/generative-ai';
import { REPAIR_ANALYSIS_PROMPT } from '../prompts.js';

/**
 * Analyze a property photo using Gemini 2.5 Pro.
 * @param {string} base64Image - Base64-encoded image (no data URI prefix)
 * @param {string} mimeType - e.g. "image/jpeg"
 * @returns {Promise<Object>} Structured repair analysis
 */
export async function analyzeWithGoogle(base64Image, mimeType = 'image/jpeg') {
  if (!process.env.GOOGLE_AI_API_KEY) throw new Error('GOOGLE_AI_API_KEY is not set in .env.local');
  const client = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  const model = client.getGenerativeModel({ model: 'gemini-2.5-pro' });

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType,
        data: base64Image,
      },
    },
    REPAIR_ANALYSIS_PROMPT,
  ]);

  const text = result.response.text();
  return parseJSON(text);
}

function parseJSON(text) {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    return JSON.parse(match ? match[0] : text);
  } catch {
    throw new Error('Google returned invalid JSON: ' + text);
  }
}

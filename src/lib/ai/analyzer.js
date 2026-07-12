/**
 * ScopeWork — Model-Agnostic Photo Analyzer
 * 
 * Accepts a photo and a model choice, routes to the right provider,
 * and always returns the same structured result.
 * 
 * Supported models: 'openai' | 'anthropic' | 'google'
 * Default: 'openai'
 */

import { analyzeWithOpenAI } from './providers/openai.js';
import { analyzeWithAnthropic } from './providers/anthropic.js';
import { analyzeWithGoogle } from './providers/google.js';

/**
 * Analyze a property photo for repairs.
 * 
 * @param {string} base64Image - Base64-encoded image data (no data URI prefix)
 * @param {string} mimeType - MIME type, e.g. "image/jpeg"
 * @param {'openai'|'anthropic'|'google'} model - Which AI provider to use
 * @returns {Promise<AnalysisResult>}
 */
export async function analyzePhoto(base64Image, mimeType = 'image/jpeg', model = 'openai') {
  let result;

  switch (model) {
    case 'anthropic':
      result = await analyzeWithAnthropic(base64Image, mimeType);
      break;
    case 'google':
      result = await analyzeWithGoogle(base64Image, mimeType);
      break;
    case 'openai':
    default:
      result = await analyzeWithOpenAI(base64Image, mimeType);
      break;
  }

  return normalizeResult(result, model);
}

/**
 * Normalize the result to a consistent shape regardless of provider.
 */
function normalizeResult(raw, model) {
  return {
    model,
    photoQuality: raw.photoQuality || 'good',
    photoFeedback: raw.photoFeedback || null,
    repairs: (raw.repairs || []).map((r) => ({
      type: r.type || 'Unknown repair',
      location: r.location || 'Unknown location',
      severity: r.severity || 'minor',
      confidence: typeof r.confidence === 'number' ? r.confidence : 0.5,
      needsCloserPhoto: r.needsCloserPhoto || false,
      guidance: r.guidance || null,
    })),
  };
}

/**
 * @typedef {Object} AnalysisResult
 * @property {'openai'|'anthropic'|'google'} model
 * @property {'good'|'needs_improvement'} photoQuality
 * @property {string|null} photoFeedback
 * @property {RepairDetection[]} repairs
 */

/**
 * @typedef {Object} RepairDetection
 * @property {string} type
 * @property {string} location
 * @property {'minor'|'moderate'|'major'} severity
 * @property {number} confidence
 * @property {boolean} needsCloserPhoto
 * @property {string|null} guidance
 */

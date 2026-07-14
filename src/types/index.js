/**
 * ScopeWork — Core Type Definitions (JSDoc)
 * Reference for data shapes used across the app.
 */

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} address
 * @property {string} notes
 * @property {'openai'|'anthropic'|'google'} model
 * @property {string} createdAt        - ISO date string
 * @property {string|null} thumbnail   - data URL of the first photo (compressed)
 * @property {Photo[]} photos
 * @property {Repair[]} repairs
 */

/**
 * @typedef {Object} Photo
 * @property {string} id
 * @property {string} timestamp        - ISO date string
 * @property {AnalysisResult|null} analysisResult
 * @property {string|null} error       - set if analysis failed
 * @property {string|null} icon        - 96×96 data URL for repair row icons
 */

/**
 * @typedef {Object} Repair
 * @property {string} type             - e.g. "Water stain", "Cracked drywall"
 * @property {string} location         - e.g. "Ceiling near window"
 * @property {'minor'|'moderate'|'major'} severity
 * @property {number} confidence       - 0 to 1
 * @property {boolean} needsCloserPhoto
 * @property {string|null} guidance    - photo guidance when needsCloserPhoto is true
 * @property {string} photoId          - ID of the source Photo
 * @property {number} photoIndex       - 1-based index of the source photo
 */

/**
 * @typedef {Object} AnalysisResult
 * @property {'openai'|'anthropic'|'google'} model
 * @property {'good'|'needs_improvement'} photoQuality
 * @property {string|null} photoFeedback
 * @property {Repair[]} repairs
 */

/**
 * @typedef {Object} Contractor
 * @property {string} id
 * @property {string} name
 * @property {string} specialty
 * @property {string} phone
 * @property {string} rate             - e.g. "$85/hr"
 * @property {string[]} trades         - trade categories this contractor covers
 */

export {};

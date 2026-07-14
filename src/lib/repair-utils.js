/**
 * ScopeWork — Shared repair display utilities
 * Used by both the project detail page and the report page.
 */

export const SEVERITY_BADGE = {
  major:    'bg-red-100 text-red-700',
  moderate: 'bg-orange-100 text-orange-700',
  minor:    'bg-[#F1F2F3] text-[#6E737B]',
};

export const TRADE_COLORS = {
  PLUMBING:          'bg-blue-50 text-blue-700',
  ROOFING:           'bg-slate-100 text-slate-600',
  ELECTRICAL:        'bg-yellow-50 text-yellow-700',
  HVAC:              'bg-purple-50 text-purple-700',
  'WINDOWS & DOORS': 'bg-green-50 text-green-700',
  FLOORING:          'bg-orange-50 text-orange-700',
  STRUCTURAL:        'bg-red-50 text-red-700',
  COSMETIC:          'bg-pink-50 text-pink-700',
  GENERAL:           'bg-gray-100 text-gray-600',
};

/**
 * Infer trade category from a repair type string.
 * @param {string} type
 * @returns {string}
 */
export function inferTrade(type = '') {
  const t = type.toLowerCase();
  if (/roof|shingle|gutter|fascia|soffit/.test(t))              return 'ROOFING';
  if (/plumb|pipe|water|leak|drain|faucet|toilet|sewage/.test(t)) return 'PLUMBING';
  if (/electric|outlet|wir|panel|circuit|breaker|switch/.test(t)) return 'ELECTRICAL';
  if (/hvac|heat|cool|furnace|\bac\b|air cond|duct/.test(t))     return 'HVAC';
  if (/window|door|frame|slider|garage door/.test(t))            return 'WINDOWS & DOORS';
  if (/floor|tile|carpet|hardwood|laminate|vinyl/.test(t))       return 'FLOORING';
  if (/foundation|structural|crack|wall|ceiling|drywall|siding/.test(t)) return 'STRUCTURAL';
  if (/paint|cabinet|trim|cosmetic|finish|stain|refinish/.test(t)) return 'COSMETIC';
  return 'GENERAL';
}

/**
 * Estimate cost range as numbers for a given severity.
 * @param {'major'|'moderate'|'minor'} severity
 * @returns {[number, number]} [low, high]
 */
export function estimateCostRange(severity) {
  if (severity === 'major')    return [1500, 5000];
  if (severity === 'moderate') return [400,  1500];
  return                              [100,  500];
}

/**
 * Group an array of repairs by their inferred trade.
 * @param {Array} repairs
 * @returns {Object} trade → repairs[]
 */
export function groupByTrade(repairs = []) {
  const groups = {};
  for (const r of repairs) {
    const trade = inferTrade(r.type);
    if (!groups[trade]) groups[trade] = [];
    groups[trade].push(r);
  }
  return groups;
}

/**
 * Count repairs by severity.
 * @param {Array} repairs
 * @returns {{ major: number, moderate: number, minor: number }}
 */
export function countBySeverity(repairs = []) {
  return repairs.reduce(
    (acc, r) => {
      const s = r?.severity || 'minor';
      if (s in acc) acc[s]++;
      return acc;
    },
    { major: 0, moderate: 0, minor: 0 }
  );
}

/**
 * Sum cost range across all repairs.
 * @param {Array} repairs
 * @returns {{ low: number, high: number }}
 */
export function totalCostRange(repairs = []) {
  return repairs.reduce(
    (acc, r) => {
      const [low, high] = estimateCostRange(r.severity);
      return { low: acc.low + low, high: acc.high + high };
    },
    { low: 0, high: 0 }
  );
}

/**
 * Label for each AI model.
 * @param {string} m
 * @returns {string}
 */
export function getModelLabel(m) {
  if (m === 'anthropic') return 'Claude';
  if (m === 'google')    return 'Gemini';
  return 'GPT-4o';
}

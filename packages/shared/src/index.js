// Severity levels
export const SEVERITY = { MAJOR: 'major', MODERATE: 'moderate', MINOR: 'minor' };

// Trade categories
export const TRADES = ['ROOFING','PLUMBING','ELECTRICAL','HVAC','WINDOWS & DOORS','FLOORING','STRUCTURAL','COSMETIC','GENERAL'];

// Mock projects for development/demo
export const MOCK_PROJECTS = [
  {
    id: 'mock-1',
    address: '1428 Elm St, Tampa, FL 33602',
    notes: '3BR/2BA rental, built 1978, vacant',
    model: 'openai',
    status: 'estimate_ready',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    photos: [
      { id: 'p1', url: 'https://images.unsplash.com/photo-1564013799919-ab3d54bcd0f8?w=600&h=400&fit=crop', status: 'analyzed' },
      { id: 'p2', url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&h=400&fit=crop', status: 'analyzed' },
    ],
    repairs: [
      { id: 'r1', type: 'Roof membrane failure', location: 'Main roof', severity: 'major', confidence: 0.91, trade: 'ROOFING' },
      { id: 'r2', type: 'Leak under kitchen sink', location: 'Kitchen', severity: 'moderate', confidence: 0.85, trade: 'PLUMBING' },
      { id: 'r3', type: 'Damaged drywall — hallway', location: 'Hallway', severity: 'moderate', confidence: 0.78, trade: 'COSMETIC' },
      { id: 'r4', type: 'Outlet cover missing', location: 'Living room', severity: 'minor', confidence: 0.95, trade: 'ELECTRICAL' },
    ],
  },
  {
    id: 'mock-2',
    address: '892 Magnolia Ave, Orlando, FL 32801',
    notes: 'Flip candidate, needs full rehab',
    model: 'anthropic',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    photos: [
      { id: 'p3', url: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=600&h=400&fit=crop', status: 'analyzed' },
    ],
    repairs: [
      { id: 'r5', type: 'Foundation crack — east wall', location: 'Foundation', severity: 'major', confidence: 0.88, trade: 'STRUCTURAL' },
      { id: 'r6', type: 'HVAC unit not operational', location: 'Utility room', severity: 'major', confidence: 0.92, trade: 'HVAC' },
      { id: 'r7', type: 'Carpet — full replacement', location: 'Bedrooms', severity: 'minor', confidence: 0.99, trade: 'FLOORING' },
    ],
  },
  {
    id: 'mock-3',
    address: '315 Cypress Ln, St. Pete, FL 33701',
    notes: 'Light cosmetic work only',
    model: 'google',
    status: 'estimate_ready',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    photos: [],
    repairs: [
      { id: 'r8', type: 'Interior paint — full house', location: 'All rooms', severity: 'minor', confidence: 0.99, trade: 'COSMETIC' },
      { id: 'r9', type: 'Kitchen cabinet refinish', location: 'Kitchen', severity: 'minor', confidence: 0.94, trade: 'COSMETIC' },
    ],
  },
];

// Mock contractors
export const MOCK_CONTRACTORS = [
  { id: 'c1', name: 'Mike Torres', specialty: 'Roofing', phone: '(813) 555-0192', rate: '$85/hr', trades: ['ROOFING'] },
  { id: 'c2', name: 'Dave Ellis', specialty: 'Plumbing', phone: '(813) 555-0341', rate: '$95/hr', trades: ['PLUMBING'] },
  { id: 'c3', name: 'Ray Nguyen', specialty: 'Electrical', phone: '(813) 555-0517', rate: '$110/hr', trades: ['ELECTRICAL'] },
  { id: 'c4', name: 'Carlos Reyes', specialty: 'General Contractor', phone: '(813) 555-0784', rate: '$75/hr', trades: ['COSMETIC','FLOORING','GENERAL'] },
];

// Cost estimate ranges by severity
export function estimateCostRange(severity) {
  if (severity === 'major')    return [1500, 5000];
  if (severity === 'moderate') return [400,  1500];
  return                              [100,  500];
}

// Format currency
export function formatCostRange(low, high) {
  return `$${low.toLocaleString()} – $${high.toLocaleString()}`;
}

// Infer trade from repair type string
export function inferTrade(type = '') {
  const t = type.toLowerCase();
  if (/roof|shingle|gutter|fascia|soffit/.test(t)) return 'ROOFING';
  if (/plumb|pipe|water|leak|drain|faucet|toilet|sewage/.test(t)) return 'PLUMBING';
  if (/electric|outlet|wir|panel|circuit|breaker|switch/.test(t)) return 'ELECTRICAL';
  if (/hvac|heat|cool|furnace|\bac\b|air cond|duct/.test(t)) return 'HVAC';
  if (/window|door|frame|slider|garage door/.test(t)) return 'WINDOWS & DOORS';
  if (/floor|tile|carpet|hardwood|laminate|vinyl/.test(t)) return 'FLOORING';
  if (/foundation|structural|crack|wall|ceiling|drywall|siding/.test(t)) return 'STRUCTURAL';
  if (/paint|cabinet|trim|cosmetic|finish|stain|refinish/.test(t)) return 'COSMETIC';
  return 'GENERAL';
}

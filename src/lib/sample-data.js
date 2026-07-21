/**
 * ScopeWork — Sample Projects
 * Realistic demo data for development and presentations.
 * Loaded via the dashboard empty state — seeds directly into Supabase.
 */

import { createClient } from '@/lib/supabase/client';

// Unsplash house photos (same set used by dashboard placeholders)
const PHOTOS = [
  'https://images.unsplash.com/photo-1564013799919-ab3d54bcd0f8?w=600&h=400&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&h=400&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=600&h=400&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&h=400&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop&auto=format',
];

function makeId(seed) {
  // Deterministic-looking UUID-style id so samples look consistent
  return `sample-${seed}`;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function makePhoto(photoId, photoIndex, model, repairs) {
  return {
    id: photoId,
    timestamp: daysAgo(Math.floor(Math.random() * 10) + 1),
    analysisResult: {
      model,
      photoQuality: 'good',
      photoFeedback: null,
      repairs,
    },
    error: null,
    icon: null,
  };
}

function makeRepair(type, location, severity, confidence, photoId, photoIndex, opts = {}) {
  return {
    type,
    location,
    severity,
    confidence,
    needsCloserPhoto: opts.needsCloserPhoto || false,
    guidance: opts.guidance || null,
    photoId,
    photoIndex,
  };
}

// ---------------------------------------------------------------------------
// Project 1 — Tampa flip candidate, heavy repairs
// ---------------------------------------------------------------------------
const p1Id = makeId('oak-ridge');
const p1Photo1 = makeId('p1-ph1');
const p1Photo2 = makeId('p1-ph2');
const p1Repairs1 = [
  makeRepair('Missing/damaged roof shingles', 'Front slope, left section', 'major', 0.92, p1Photo1, 1),
  makeRepair('Damaged gutters — pulling away from fascia', 'Front roofline', 'moderate', 0.87, p1Photo1, 1),
  makeRepair('Rotten fascia board', 'Front eave, above garage', 'moderate', 0.83, p1Photo1, 1),
];
const p1Repairs2 = [
  makeRepair('Water stain on ceiling', 'Master bedroom, northeast corner', 'major', 0.95, p1Photo2, 2, { needsCloserPhoto: true, guidance: 'Get a straight-on shot of the stain to measure spread.' }),
  makeRepair('Cracked drywall', 'Hallway wall near staircase', 'moderate', 0.88, p1Photo2, 2),
  makeRepair('Peeling paint — interior', 'Hallway ceiling', 'minor', 0.78, p1Photo2, 2),
];
const project1 = {
  id: p1Id,
  address: '1847 Oak Ridge Dr, Tampa, FL 33614',
  notes: '3BR/2BA single family, built 1981, vacant for 6 months. Roof and water damage are the priority.',
  model: 'openai',
  createdAt: daysAgo(12),
  thumbnail: PHOTOS[0],
  photos: [
    makePhoto(p1Photo1, 1, 'openai', p1Repairs1),
    makePhoto(p1Photo2, 2, 'openai', p1Repairs2),
  ],
  repairs: [...p1Repairs1, ...p1Repairs2],
};

// ---------------------------------------------------------------------------
// Project 2 — St. Pete rental property, moderate repairs
// ---------------------------------------------------------------------------
const p2Id = makeId('sunset-blvd');
const p2Photo1 = makeId('p2-ph1');
const p2Repairs1 = [
  makeRepair('Peeling exterior paint', 'South-facing wall, full height', 'moderate', 0.91, p2Photo1, 1),
  makeRepair('Broken window — single pane cracked', 'Dining room, front-facing', 'moderate', 0.96, p2Photo1, 1),
  makeRepair('Rotted deck boards', 'Rear deck, 3 boards near door', 'major', 0.89, p2Photo1, 1),
  makeRepair('Loose deck railing', 'Rear deck, right side', 'moderate', 0.84, p2Photo1, 1),
];
const project2 = {
  id: p2Id,
  address: '3224 Sunset Blvd, St. Petersburg, FL 33713',
  notes: 'Active rental, tenant vacating end of month. Exterior + deck work before next tenant.',
  model: 'anthropic',
  createdAt: daysAgo(5),
  thumbnail: PHOTOS[1],
  photos: [makePhoto(p2Photo1, 1, 'anthropic', p2Repairs1)],
  repairs: p2Repairs1,
};

// ---------------------------------------------------------------------------
// Project 3 — Orlando duplex, electrical + plumbing concerns
// ---------------------------------------------------------------------------
const p3Id = makeId('maple-ave');
const p3Photo1 = makeId('p3-ph1');
const p3Photo2 = makeId('p3-ph2');
const p3Repairs1 = [
  makeRepair('Outdated electrical panel — fuses, no breakers', 'Utility closet, unit A', 'major', 0.97, p3Photo1, 1),
  makeRepair('Exposed wiring above panel', 'Utility closet ceiling', 'major', 0.93, p3Photo1, 1),
];
const p3Repairs2 = [
  makeRepair('Mold growth on bathroom wall', 'Unit B bathroom, behind toilet', 'major', 0.94, p3Photo2, 2),
  makeRepair('Dripping faucet — slow leak visible', 'Unit B kitchen sink', 'minor', 0.88, p3Photo2, 2),
  makeRepair('Cracked tile — floor', 'Unit B bathroom, 4 tiles near tub', 'minor', 0.81, p3Photo2, 2),
  makeRepair('Caulk failure around tub surround', 'Unit B bathroom, full perimeter', 'moderate', 0.86, p3Photo2, 2),
];
const project3 = {
  id: p3Id,
  address: '712 Maple Ave, Orlando, FL 32801',
  notes: 'Duplex — both units currently vacant. Electrical is a must-fix before listing.',
  model: 'google',
  createdAt: daysAgo(3),
  thumbnail: PHOTOS[2],
  photos: [
    makePhoto(p3Photo1, 1, 'google', p3Repairs1),
    makePhoto(p3Photo2, 2, 'google', p3Repairs2),
  ],
  repairs: [...p3Repairs1, ...p3Repairs2],
};

// ---------------------------------------------------------------------------
// Project 4 — Sarasota cosmetic flip, mostly minor
// ---------------------------------------------------------------------------
const p4Id = makeId('riverside-ct');
const p4Photo1 = makeId('p4-ph1');
const p4Repairs1 = [
  makeRepair('Outdated kitchen cabinets — cosmetic', 'Kitchen, full perimeter', 'moderate', 0.82, p4Photo1, 1),
  makeRepair('Laminate countertop — worn, bubbling', 'Kitchen, main counter', 'moderate', 0.85, p4Photo1, 1),
  makeRepair('Vinyl flooring lifting at seams', 'Kitchen floor, near refrigerator', 'minor', 0.79, p4Photo1, 1),
  makeRepair('Ceiling fan wobbling / noisy', 'Kitchen, center', 'minor', 0.75, p4Photo1, 1),
];
const project4 = {
  id: p4Id,
  address: '5501 Riverside Ct, Sarasota, FL 34231',
  notes: 'Light cosmetic flip — bones are good. Focus: kitchen update and flooring throughout.',
  model: 'openai',
  createdAt: daysAgo(1),
  thumbnail: PHOTOS[3],
  photos: [makePhoto(p4Photo1, 1, 'openai', p4Repairs1)],
  repairs: p4Repairs1,
};

// ---------------------------------------------------------------------------
// Project 5 — Miami landlord, fresh inspection, no repairs yet
// ---------------------------------------------------------------------------
const p5Id = makeId('brickell-dr');
const project5 = {
  id: p5Id,
  address: '221 Brickell Dr, Miami, FL 33131',
  notes: 'Pre-listing walkthrough. Unit looks clean — just starting the inspection.',
  model: 'openai',
  createdAt: daysAgo(0),
  thumbnail: PHOTOS[4],
  photos: [],
  repairs: [],
};

// ---------------------------------------------------------------------------
export const SAMPLE_PROJECTS = [project1, project2, project3, project4, project5];

/**
 * Seed sample projects into Supabase for the current logged-in user.
 * Safe to call multiple times — skips if samples already exist.
 */
export async function loadSampleProjects() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be logged in to load samples');

  // Check if samples already exist
  const { count } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_sample', true);

  if (count > 0) return; // already seeded

  for (const project of SAMPLE_PROJECTS) {
    // Insert project
    const { data: dbProject, error: pErr } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        address: project.address,
        notes: project.notes,
        model: project.model,
        thumbnail: project.thumbnail,
        is_sample: true,
        created_at: project.createdAt,
      })
      .select()
      .single();

    if (pErr || !dbProject) continue;

    // Insert photos + their repairs
    for (const photo of project.photos) {
      const photoIndex = project.photos.indexOf(photo) + 1;

      const { data: dbPhoto, error: phErr } = await supabase
        .from('photos')
        .insert({
          project_id: dbProject.id,
          user_id: user.id,
          analysis_result: photo.analysisResult,
          error: photo.error,
          icon: photo.icon,
          photo_index: photoIndex,
          created_at: photo.timestamp,
        })
        .select()
        .single();

      if (phErr || !dbPhoto) continue;

      const photoRepairs = project.repairs.filter((r) => r.photoId === photo.id);
      if (photoRepairs.length > 0) {
        await supabase.from('repairs').insert(
          photoRepairs.map((r) => ({
            project_id: dbProject.id,
            photo_id: dbPhoto.id,
            user_id: user.id,
            type: r.type,
            location: r.location,
            severity: r.severity,
            confidence: r.confidence,
            needs_closer_photo: r.needsCloserPhoto,
            guidance: r.guidance,
            photo_index: r.photoIndex,
          }))
        );
      }
    }
  }
}

/**
 * Delete all sample projects for the current user.
 */
export async function clearSampleProjects() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('projects')
    .delete()
    .eq('user_id', user.id)
    .eq('is_sample', true);
}

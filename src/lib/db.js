/**
 * ScopeWork — Supabase data layer
 * All async. Replaces the localStorage-based src/lib/projects.js.
 */

import { createClient } from '@/lib/supabase/client';

// ---------------------------------------------------------------------------
// Shape normalizer — maps DB snake_case rows → app camelCase Project shape
// ---------------------------------------------------------------------------
function toProjectShape(dbProject, dbPhotos = [], dbRepairs = []) {
  return {
    id: dbProject.id,
    address: dbProject.address || '',
    notes: dbProject.notes || '',
    model: dbProject.model || 'openai',
    createdAt: dbProject.created_at,
    thumbnail: dbProject.thumbnail || null,
    isSample: dbProject.is_sample || false,
    photos: (dbPhotos || [])
      .sort((a, b) => a.photo_index - b.photo_index)
      .map((p) => ({
        id: p.id,
        timestamp: p.created_at,
        analysisResult: p.analysis_result,
        error: p.error,
        icon: p.icon,
      })),
    repairs: (dbRepairs || [])
      .sort((a, b) => a.photo_index - b.photo_index)
      .map((r) => ({
        type: r.type,
        location: r.location,
        severity: r.severity,
        confidence: parseFloat(r.confidence),
        needsCloserPhoto: r.needs_closer_photo,
        guidance: r.guidance,
        photoId: r.photo_id,
        photoIndex: r.photo_index,
      })),
  };
}

// ---------------------------------------------------------------------------
// getProjects — returns all projects for the current user
// ---------------------------------------------------------------------------
export async function getProjects() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*, photos(*), repairs(*)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map((p) => toProjectShape(p, p.photos, p.repairs));
}

// ---------------------------------------------------------------------------
// getProject — returns a single project by id
// ---------------------------------------------------------------------------
export async function getProject(id) {
  if (!id) return null;
  const supabase = createClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*, photos(*), repairs(*)')
    .eq('id', id)
    .single();

  if (error) return null;
  return toProjectShape(data, data.photos, data.repairs);
}

// ---------------------------------------------------------------------------
// createProject
// ---------------------------------------------------------------------------
export async function createProject({ address, notes = '', model = 'openai' }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      address: String(address || '').trim(),
      notes: String(notes || '').trim(),
      model,
    })
    .select('*, photos(*), repairs(*)')
    .single();

  if (error) throw error;
  return toProjectShape(data, data.photos, data.repairs);
}

// ---------------------------------------------------------------------------
// addPhotoResult — saves a photo + its repairs, updates thumbnail if first
// ---------------------------------------------------------------------------
export async function addPhotoResult(projectId, photoId, analysisResult, thumbnail = null, iconThumbnail = null) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const repairs = Array.isArray(analysisResult?.repairs) ? analysisResult.repairs : [];

  // Current photo count → determines photo_index
  const { count } = await supabase
    .from('photos')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId);

  const photoIndex = (count || 0) + 1;
  const resolvedPhotoId = photoId || crypto.randomUUID();

  // Insert photo row
  const { error: photoError } = await supabase.from('photos').insert({
    id: resolvedPhotoId,
    project_id: projectId,
    user_id: user.id,
    analysis_result: analysisResult,
    error: null,
    icon: iconThumbnail || null,
    photo_index: photoIndex,
  });

  if (photoError) throw photoError;

  // Insert repair rows
  if (repairs.length > 0) {
    const { error: repairsError } = await supabase.from('repairs').insert(
      repairs.map((r) => ({
        project_id: projectId,
        photo_id: resolvedPhotoId,
        user_id: user.id,
        type: r?.type || 'Unknown repair',
        location: r?.location || 'Unknown location',
        severity: r?.severity || 'minor',
        confidence: typeof r?.confidence === 'number' ? r.confidence : 0.5,
        needs_closer_photo: Boolean(r?.needsCloserPhoto),
        guidance: r?.guidance || null,
        photo_index: photoIndex,
      }))
    );
    if (repairsError) throw repairsError;
  }

  // Update project thumbnail from first photo
  if (thumbnail) {
    const { data: proj } = await supabase
      .from('projects')
      .select('thumbnail')
      .eq('id', projectId)
      .single();

    if (!proj?.thumbnail) {
      await supabase
        .from('projects')
        .update({ thumbnail })
        .eq('id', projectId);
    }
  }

  return getProject(projectId);
}

// ---------------------------------------------------------------------------
// addPhotoError — records a failed photo analysis
// ---------------------------------------------------------------------------
export async function addPhotoError(projectId, photoId, error) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { count } = await supabase
    .from('photos')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId);

  await supabase.from('photos').insert({
    id: photoId || crypto.randomUUID(),
    project_id: projectId,
    user_id: user.id,
    analysis_result: null,
    error: String(error || 'Analysis failed'),
    photo_index: (count || 0) + 1,
  });

  return getProject(projectId);
}

// ---------------------------------------------------------------------------
// deleteProject
// ---------------------------------------------------------------------------
export async function deleteProject(id) {
  const supabase = createClient();
  const { error } = await supabase.from('projects').delete().eq('id', id);
  return !error;
}

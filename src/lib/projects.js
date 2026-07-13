const STORAGE_KEY = 'scopework_projects';

function hasWindow() {
  return typeof window !== 'undefined';
}

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `project_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function readStoredProjects() {
  if (!hasWindow()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredProjects(projects) {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  window.dispatchEvent(new Event('scopework-projects-changed'));
}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function normalizeProject(project) {
  if (!project || typeof project !== 'object') {
    return null;
  }

  return {
    id: project.id,
    address: project.address || '',
    notes: project.notes || '',
    model: project.model || 'openai',
    createdAt: project.createdAt,
    photos: Array.isArray(project.photos) ? project.photos : [],
    repairs: Array.isArray(project.repairs) ? project.repairs : [],
  };
}

export function getProjects() {
  return readStoredProjects()
    .map(normalizeProject)
    .filter(Boolean)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getProject(id) {
  if (!id) {
    return null;
  }

  const project = getProjects().find((item) => item.id === id);
  return project ? clone(project) : null;
}

export function createProject({ address, notes = '', model = 'openai' }) {
  const projects = readStoredProjects();
  const project = normalizeProject({
    id: createId(),
    address: String(address || '').trim(),
    notes: String(notes || '').trim(),
    model,
    createdAt: new Date().toISOString(),
    photos: [],
    repairs: [],
  });

  projects.unshift(project);
  writeStoredProjects(projects);
  return clone(project);
}

export function addPhotoResult(projectId, photoId, analysisResult) {
  const projects = readStoredProjects();
  const index = projects.findIndex((project) => project.id === projectId);

  if (index === -1) {
    return null;
  }

  const project = normalizeProject(projects[index]);
  const photoIndex = project.photos.length + 1;
  const now = new Date().toISOString();
  const resolvedPhotoId = photoId || createId();
  const repairs = Array.isArray(analysisResult?.repairs) ? analysisResult.repairs : [];

  project.photos.push({
    id: resolvedPhotoId,
    timestamp: now,
    analysisResult: clone(analysisResult),
    error: null,
  });

  project.repairs.push(
    ...repairs.map((repair) => ({
      type: repair?.type || 'Unknown repair',
      location: repair?.location || 'Unknown location',
      severity: repair?.severity || 'minor',
      confidence: typeof repair?.confidence === 'number' ? repair.confidence : 0.5,
      needsCloserPhoto: Boolean(repair?.needsCloserPhoto),
      guidance: repair?.guidance || null,
      photoId: resolvedPhotoId,
      photoIndex,
    }))
  );

  projects[index] = project;
  writeStoredProjects(projects);
  return clone(project);
}

export function addPhotoError(projectId, photoId, error) {
  const projects = readStoredProjects();
  const index = projects.findIndex((project) => project.id === projectId);

  if (index === -1) {
    return null;
  }

  const project = normalizeProject(projects[index]);

  project.photos.push({
    id: photoId || createId(),
    timestamp: new Date().toISOString(),
    analysisResult: null,
    error: String(error || 'Analysis failed'),
  });

  projects[index] = project;
  writeStoredProjects(projects);
  return clone(project);
}

export function deleteProject(id) {
  const projects = readStoredProjects();
  const nextProjects = projects.filter((project) => project.id !== id);

  if (nextProjects.length === projects.length) {
    return false;
  }

  writeStoredProjects(nextProjects);
  return true;
}

// Base URL — override with NEXT_PUBLIC_API_URL or EXPO_PUBLIC_API_URL env var
export function getApiBase() {
  if (typeof process !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
  }
  return 'http://localhost:3000';
}

// Auth
export async function apiLogin(email, password) {
  const res = await fetch(`${getApiBase()}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

// Projects
export async function apiGetProjects(token) {
  const res = await fetch(`${getApiBase()}/api/projects`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
}

export async function apiCreateProject(data, token) {
  const res = await fetch(`${getApiBase()}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create project');
  return res.json();
}

export async function apiGetProject(id, token) {
  const res = await fetch(`${getApiBase()}/api/projects/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch project');
  return res.json();
}

// Photos
export async function apiAnalyzePhoto(projectId, photoBase64, model, token) {
  const res = await fetch(`${getApiBase()}/api/analyze-photo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ projectId, photo: photoBase64, model }),
  });
  if (!res.ok) throw new Error('Failed to analyze photo');
  return res.json();
}

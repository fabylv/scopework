import { supabase } from "../supabase";

/**
 * Fetch all projects for the authenticated user.
 * @returns {Promise<{data: Array, error: object|null}>}
 */
export async function getProjects() {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
  return { data, error };
}

/**
 * Fetch a single project by id.
 * @param {string} id
 */
export async function getProject(id) {
  const { data, error } = await supabase
    .from("projects")
    .select("*, issues(*), photos(*)")
    .eq("id", id)
    .single();
  return { data, error };
}

/**
 * Create a new project.
 * @param {{ name: string, address?: string, notes?: string }} payload
 */
export async function createProject(payload) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("projects")
    .insert({ ...payload, user_id: user.id })
    .select()
    .single();
  return { data, error };
}

/**
 * Update a project by id.
 * @param {string} id
 * @param {object} updates
 */
export async function updateProject(id, updates) {
  const { data, error } = await supabase
    .from("projects")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

/**
 * Delete a project by id.
 * @param {string} id
 */
export async function deleteProject(id) {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  return { error };
}

import { supabase } from "../supabase";

/**
 * Get all issues for a project, ordered by category.
 * @param {string} projectId
 */
export async function getIssues(projectId) {
  const { data, error } = await supabase
    .from("issues")
    .select("*")
    .eq("project_id", projectId)
    .order("category", { ascending: true });
  return { data, error };
}

/**
 * Update an issue (e.g. edited cost estimate or notes).
 * @param {string} id
 * @param {object} updates
 */
export async function updateIssue(id, updates) {
  const { data, error } = await supabase
    .from("issues")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

/**
 * Delete an issue by id.
 * @param {string} id
 */
export async function deleteIssue(id) {
  const { error } = await supabase.from("issues").delete().eq("id", id);
  return { error };
}

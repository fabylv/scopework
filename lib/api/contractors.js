import { supabase } from "../supabase";

/**
 * Get all contractors for the authenticated user.
 */
export async function getContractors() {
  const { data, error } = await supabase
    .from("contractors")
    .select("*")
    .order("name", { ascending: true });
  return { data, error };
}

/**
 * Create a new contractor.
 * @param {{ name: string, trade: string, phone?: string, email?: string, rate?: number }} payload
 */
export async function createContractor(payload) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");
  const { data, error } = await supabase
    .from("contractors")
    .insert({ ...payload, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Update a contractor by id.
 * @param {string} id
 * @param {object} updates
 */
export async function updateContractor(id, updates) {
  const { data, error } = await supabase
    .from("contractors")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

/**
 * Delete a contractor by id.
 * @param {string} id
 */
export async function deleteContractor(id) {
  const { error } = await supabase.from("contractors").delete().eq("id", id);
  if (error) throw error;
}

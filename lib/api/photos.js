import { supabase } from "../supabase";

/**
 * Upload a photo to Supabase Storage and create a DB record.
 * @param {string} projectId
 * @param {{ uri: string, mimeType?: string, fileName?: string }} file
 * @param {function} onProgress - optional progress callback (0-100)
 */
export async function uploadPhoto(projectId, file) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const ext = file.fileName?.split(".").pop() ?? "jpg";
  const path = `${user.id}/${projectId}/${Date.now()}.${ext}`;

  // Convert URI to blob — handle data URLs (web) and file paths (native)
  let blob;
  if (file.uri.startsWith("data:")) {
    const [, base64] = file.uri.split(",");
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    blob = new Blob([bytes], { type: file.mimeType ?? "image/jpeg" });
  } else {
    const response = await fetch(file.uri);
    blob = await response.blob();
  }

  const { error: uploadError } = await supabase.storage
    .from("repair-photos")
    .upload(path, blob, { contentType: file.mimeType ?? "image/jpeg", upsert: false });
  if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

  const { data: { publicUrl } } = supabase.storage.from("repair-photos").getPublicUrl(path);

  const { data, error } = await supabase
    .from("photos")
    .insert({ project_id: projectId, storage_path: path, public_url: publicUrl, status: "done" })
    .select()
    .single();
  if (error) throw new Error(`DB insert failed: ${error.message}`);
  return data;
}

/**
 * Get all photos for a project.
 * @param {string} projectId
 */
export async function getPhotos(projectId) {
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });
  return { data, error };
}

/**
 * Delete a photo — removes file from storage and the DB record.
 * @param {{ id: string, storage_path: string }} photo
 */
export async function deletePhoto(photo) {
  // Remove from Storage bucket
  if (photo.storage_path) {
    const { error: storageError } = await supabase.storage
      .from("repair-photos")
      .remove([photo.storage_path]);
    if (storageError) throw storageError;
  }

  // Remove DB record
  const { error } = await supabase
    .from("photos")
    .delete()
    .eq("id", photo.id);
  if (error) throw error;
}

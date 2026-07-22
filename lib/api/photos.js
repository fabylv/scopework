import { supabase } from "../supabase";

/**
 * Upload a photo to Supabase Storage and create a DB record.
 * @param {string} projectId
 * @param {{ uri: string, mimeType?: string, fileName?: string }} file
 * @param {function} onProgress - optional progress callback (0-100)
 */
export async function uploadPhoto(projectId, file, onProgress) {
  const ext = file.fileName?.split(".").pop() ?? "jpg";
  const path = `${projectId}/${Date.now()}.${ext}`;

  // Fetch blob from local URI
  const response = await fetch(file.uri);
  const blob = await response.blob();

  const { error: uploadError } = await supabase.storage
    .from("repair-photos")
    .upload(path, blob, {
      contentType: file.mimeType ?? "image/jpeg",
      upsert: false,
    });

  if (uploadError) return { data: null, error: uploadError };

  const {
    data: { publicUrl },
  } = supabase.storage.from("repair-photos").getPublicUrl(path);

  const { data, error } = await supabase
    .from("photos")
    .insert({
      project_id: projectId,
      storage_path: path,
      public_url: publicUrl,
      status: "pending", // pending → analyzing → done | error
    })
    .select()
    .single();

  return { data, error };
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

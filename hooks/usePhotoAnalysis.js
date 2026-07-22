import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadPhoto } from "../lib/api/photos";
import { supabase } from "../lib/supabase";

/**
 * Upload a photo and trigger analysis via Supabase Edge Function.
 * The Edge Function writes structured issues back to the DB.
 *
 * @param {string} projectId
 */
export function usePhotoAnalysis(projectId) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (file) => {
      // 1. Upload to Supabase Storage + create photos DB row
      const { data: photo, error: uploadErr } = await uploadPhoto(
        projectId,
        file
      );
      if (uploadErr) throw uploadErr;

      // 2. Call Edge Function to trigger AI analysis
      const { error: fnErr } = await supabase.functions.invoke("analyze-photo", {
        body: {
          photo_id: photo.id,
          project_id: projectId,
          photo_url: photo.public_url,
        },
      });
      if (fnErr) throw fnErr;

      return photo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["photos", projectId] });
    },
  });

  return {
    analyze: mutation.mutateAsync,
    isUploading: mutation.status === "pending",
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}

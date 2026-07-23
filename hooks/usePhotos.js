import { useQuery, useQueryClient } from "@tanstack/react-query";
import { deletePhoto, getPhotos } from "../lib/api/photos";

/**
 * Fetch all photos for a project.
 * @param {string} projectId
 */
export function usePhotos(projectId) {
  return useQuery({
    queryKey: ["photos", projectId],
    queryFn: async () => {
      const { data, error } = await getPhotos(projectId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!projectId,
  });
}

/**
 * Returns a function to delete a photo and refetch.
 * @param {string} projectId
 */
export function useDeletePhoto(projectId) {
  const queryClient = useQueryClient();

  return async (photo) => {
    await deletePhoto(photo);
    queryClient.invalidateQueries({ queryKey: ["photos", projectId] });
  };
}

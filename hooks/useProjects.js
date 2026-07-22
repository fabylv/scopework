import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isMockMode, MOCK_PROJECTS } from "../lib/mockData";
import {
  createProject,
  deleteProject,
  getProject,
  getProjects,
  updateProject,
} from "../lib/api/projects";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      if (isMockMode()) return MOCK_PROJECTS;
      const { data, error } = await getProjects();
      if (error) throw error;
      return data;
    },
  });
}

export function useProject(id) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      if (isMockMode()) {
        return MOCK_PROJECTS.find((p) => p.id === id) ?? null;
      }
      const { data, error } = await getProject(id);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => {
      if (isMockMode()) {
        return Promise.resolve({ data: { id: `mock-${Date.now()}`, ...payload }, error: null });
      }
      return createProject(payload);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => updateProject(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", id] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteProject(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
}

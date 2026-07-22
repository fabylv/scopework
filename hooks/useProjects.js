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
      try {
        const { data, error } = await getProjects();
        if (error) return MOCK_PROJECTS; // tables not set up yet → show demo
        return data ?? MOCK_PROJECTS;
      } catch {
        return MOCK_PROJECTS;
      }
    },
  });
}

export function useProject(id) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      if (isMockMode()) return MOCK_PROJECTS.find((p) => p.id === id) ?? null;
      // Mock id fallback
      if (id?.startsWith("mock-")) return MOCK_PROJECTS.find((p) => p.id === id) ?? null;
      try {
        const { data, error } = await getProject(id);
        if (error) return MOCK_PROJECTS.find((p) => p.id === id) ?? null;
        return data;
      } catch {
        return MOCK_PROJECTS.find((p) => p.id === id) ?? null;
      }
    },
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => {
      if (isMockMode()) {
        return Promise.resolve({ id: `mock-${Date.now()}`, ...payload });
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

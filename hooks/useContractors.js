import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isMockMode, MOCK_CONTRACTORS } from "../lib/mockData";
import {
  createContractor,
  deleteContractor,
  getContractors,
  updateContractor,
} from "../lib/api/contractors";

export function useContractors() {
  return useQuery({
    queryKey: ["contractors"],
    queryFn: async () => {
      if (isMockMode()) return MOCK_CONTRACTORS;
      try {
        const { data, error } = await getContractors();
        if (error) return MOCK_CONTRACTORS; // tables not set up yet → show demo
        return data ?? MOCK_CONTRACTORS;
      } catch {
        return MOCK_CONTRACTORS;
      }
    },
  });
}

export function useCreateContractor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createContractor(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["contractors"] }),
  });
}

export function useUpdateContractor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => updateContractor(id, updates),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["contractors"] }),
  });
}

export function useDeleteContractor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteContractor(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["contractors"] }),
  });
}

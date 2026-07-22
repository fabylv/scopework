import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
      const { data, error } = await getContractors();
      if (error) throw error;
      return data;
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

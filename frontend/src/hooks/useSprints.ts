import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdvance,
  createChangeRequest,
  fetchSprints,
  reviewAdvance,
  reviewSimpleChange,
  updateChangeRequest,
} from "@services/financeApi";

export function useSprints(projectId: number) {
  return useQuery({
    queryKey: ["sprints", projectId],
    queryFn: () => fetchSprints(projectId),
    staleTime: 2 * 60 * 1000,
    enabled: projectId > 0,
  });
}

export function useCreateAdvance(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof createAdvance>[1]) =>
      createAdvance(projectId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sprints", projectId] }),
  });
}

export function useReviewAdvance(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number; status: "pending" | "accepted"; observations?: string }) =>
      reviewAdvance(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sprints", projectId] }),
  });
}

export function useReviewSimpleChange(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number; status: string; reviewComments?: string }) =>
      reviewSimpleChange(id, payload as any),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sprints", projectId] }),
  });
}

export function useCreateChangeRequest(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof createChangeRequest>[1]) =>
      createChangeRequest(projectId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sprints", projectId] });
      qc.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });
}

export function useUpdateChangeRequest(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number } & Parameters<typeof updateChangeRequest>[1]) =>
      updateChangeRequest(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sprints", projectId] });
      qc.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });
}

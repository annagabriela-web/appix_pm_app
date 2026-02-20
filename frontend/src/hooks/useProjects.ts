import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchProjectDetail, fetchProjects, updatePhaseInvoice, updateAnticipo } from "@services/financeApi";
import type { PhaseInvoicePayload, AnticipoPayload } from "@services/financeApi";

interface ProjectListParams {
  page?: number;
  currentHealthStatus?: string;
  ordering?: string;
}

export function useProjects(params?: ProjectListParams) {
  return useQuery({
    queryKey: ["projects", params],
    queryFn: () => fetchProjects(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useProjectDetail(id: number) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: () => fetchProjectDetail(id),
    staleTime: 2 * 60 * 1000,
    enabled: id > 0,
  });
}

export function useUpdatePhaseInvoice(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ phaseId, ...payload }: { phaseId: number } & PhaseInvoicePayload) =>
      updatePhaseInvoice(phaseId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });
}

export function useUpdateAnticipo(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AnticipoPayload) => updateAnticipo(projectId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });
}

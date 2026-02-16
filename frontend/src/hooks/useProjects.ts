import { useQuery } from "@tanstack/react-query";

import { fetchProjectDetail, fetchProjects } from "@services/financeApi";

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

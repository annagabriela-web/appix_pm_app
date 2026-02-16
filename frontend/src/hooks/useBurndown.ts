import { useQuery } from "@tanstack/react-query";

import { fetchBurndownData } from "@services/financeApi";

export function useBurndown(projectId: number) {
  return useQuery({
    queryKey: ["burndown", projectId],
    queryFn: () => fetchBurndownData(projectId),
    staleTime: 5 * 60 * 1000,
    enabled: projectId > 0,
  });
}

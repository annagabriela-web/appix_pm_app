import { useQuery } from "@tanstack/react-query";

import { fetchPhaseComparison } from "@services/financeApi";

export function usePhaseComparison(projectId: number) {
  return useQuery({
    queryKey: ["phase-comparison", projectId],
    queryFn: () => fetchPhaseComparison(projectId),
    staleTime: 5 * 60 * 1000,
    enabled: projectId > 0,
  });
}

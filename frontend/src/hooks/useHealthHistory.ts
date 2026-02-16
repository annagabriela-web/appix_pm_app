import { useQuery } from "@tanstack/react-query";

import { fetchHealthHistory } from "@services/financeApi";

export function useHealthHistory(projectId: number) {
  return useQuery({
    queryKey: ["health-history", projectId],
    queryFn: () => fetchHealthHistory(projectId),
    staleTime: 5 * 60 * 1000,
    enabled: projectId > 0,
  });
}

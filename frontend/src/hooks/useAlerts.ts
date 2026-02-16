import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchAlerts, markAlertRead } from "@services/financeApi";

export function useAlerts(unreadOnly?: boolean) {
  return useQuery({
    queryKey: ["alerts", { unreadOnly }],
    queryFn: () => fetchAlerts(unreadOnly),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });
}

export function useMarkAlertRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAlertRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

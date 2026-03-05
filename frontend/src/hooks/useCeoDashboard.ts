import { useQuery } from "@tanstack/react-query";
import { fetchCeoDashboard } from "@services/financeApi";
import type { CeoDashboardParams } from "@services/financeApi";

export function useCeoDashboard(params?: CeoDashboardParams) {
  return useQuery({
    queryKey: ["ceo-dashboard", params?.dateFrom, params?.dateTo],
    queryFn: () => fetchCeoDashboard(params),
    staleTime: 2 * 60 * 1000,
  });
}

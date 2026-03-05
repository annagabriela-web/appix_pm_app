import { useQuery } from "@tanstack/react-query";
import {
  fetchPersonalDashboard,
  type PersonalDashboardParams,
} from "@services/financeApi";

export function usePersonal(params?: PersonalDashboardParams) {
  return useQuery({
    queryKey: ["personal", params?.dateFrom, params?.dateTo],
    queryFn: () => fetchPersonalDashboard(params),
    staleTime: 2 * 60 * 1000,
  });
}

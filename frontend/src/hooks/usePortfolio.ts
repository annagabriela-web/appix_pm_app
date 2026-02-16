import { useQuery } from "@tanstack/react-query";

import { fetchPortfolio } from "@services/financeApi";

export function usePortfolio() {
  return useQuery({
    queryKey: ["portfolio"],
    queryFn: fetchPortfolio,
    staleTime: 2 * 60 * 1000,
  });
}

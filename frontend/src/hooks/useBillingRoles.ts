import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { BillingRole } from "@types/finance";

import {
  createBillingRole,
  deleteBillingRole,
  fetchBillingRoles,
  updateBillingRole,
} from "@services/financeApi";

export function useBillingRoles() {
  return useQuery({
    queryKey: ["billing-roles"],
    queryFn: fetchBillingRoles,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateBillingRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<BillingRole, "id">) => createBillingRole(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["billing-roles"] });
    },
  });
}

export function useUpdateBillingRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<Omit<BillingRole, "id">>;
    }) => updateBillingRole(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["billing-roles"] });
    },
  });
}

export function useDeleteBillingRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBillingRole,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["billing-roles"] });
    },
  });
}

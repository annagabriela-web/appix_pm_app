import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@services/apiClient";
import { meResponseSchema } from "@services/schemas";
import type { CurrentUser } from "@types/auth";

interface AuthContextValue {
  user: CurrentUser | null;
  isLoading: boolean;
  isError: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  isError: false,
});

async function fetchMe(): Promise<CurrentUser> {
  const { data } = await apiClient.get("/auth/me/");
  return meResponseSchema.parse(data);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["auth-me"],
    queryFn: fetchMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <AuthContext.Provider
      value={{ user: data ?? null, isLoading, isError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

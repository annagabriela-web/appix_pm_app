import { useEffect } from "react";
import QueryProvider from "@components/providers/QueryProvider";
import { AuthProvider, useAuth } from "@hooks/useAuth";

function AuthGuardInner() {
  const { isError } = useAuth();

  useEffect(() => {
    if (isError) {
      window.location.href = "/login";
    }
  }, [isError]);

  return null;
}

export default function AuthGuard() {
  return (
    <QueryProvider>
      <AuthProvider>
        <AuthGuardInner />
      </AuthProvider>
    </QueryProvider>
  );
}

import { useQuery } from "@tanstack/react-query";
import apiClient from "@services/apiClient";
import QueryProvider from "@components/providers/QueryProvider";

async function fetchMe() {
  const { data } = await apiClient.get("/auth/me/");
  return data as { firstName: string; lastName: string; email: string };
}

function UserAvatarInner() {
  const { data } = useQuery({
    queryKey: ["auth-me"],
    queryFn: fetchMe,
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  const initials = data
    ? `${data.firstName?.[0] ?? ""}${data.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";

  return (
    <div
      className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold cursor-default select-none"
      title={data?.email ?? ""}
      aria-label={`Usuario: ${data?.email ?? ""}`}
    >
      {initials}
    </div>
  );
}

export default function UserAvatar() {
  return (
    <QueryProvider>
      <UserAvatarInner />
    </QueryProvider>
  );
}

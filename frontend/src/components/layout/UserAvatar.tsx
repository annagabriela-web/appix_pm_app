import { useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@services/apiClient";
import QueryProvider from "@components/providers/QueryProvider";

async function fetchMe() {
  const { data } = await apiClient.get("/auth/me/");
  return data as {
    firstName: string;
    lastName: string;
    email: string;
    role?: string;
  };
}

async function logoutApi() {
  await apiClient.post("/auth/logout/");
}

function UserAvatarInner() {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["auth-me"],
    queryFn: fetchMe,
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  const initials = data
    ? `${data.firstName?.[0] ?? ""}${data.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";

  const fullName = data
    ? `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim()
    : "";

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logoutApi();
      queryClient.clear();
      window.location.href = "/login";
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold select-none hover:bg-teal-600 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2"
        title={data?.email ?? ""}
        aria-label={`Usuario: ${data?.email ?? ""}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* User info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">
              {fullName || "Usuario"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {data?.email ?? ""}
            </p>
            {data?.role && (
              <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary uppercase">
                {data.role}
              </span>
            )}
          </div>

          {/* Logout */}
          <div className="py-1">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {/* Logout icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              {loggingOut ? "Cerrando sesion..." : "Cerrar sesion"}
            </button>
          </div>
        </div>
      )}
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

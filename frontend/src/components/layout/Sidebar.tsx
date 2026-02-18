import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@services/apiClient";
import { meResponseSchema } from "@services/schemas";
import type { CurrentUser, UserPermissions } from "@types/auth";
import QueryProvider from "@components/providers/QueryProvider";

const COLLAPSED_KEY = "sidebar-collapsed";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  permKey?: keyof UserPermissions;
}

const allNavItems: NavItem[] = [
  { href: "/", label: "Resumen General", icon: "chart-bar", permKey: "canSeePortfolio" },
  { href: "/projects", label: "Proyectos", icon: "folder", permKey: "canSeeProjects" },
  { href: "/personal", label: "Personal", icon: "users", permKey: "canSeePersonal" },
  { href: "/billing-roles", label: "Configuracion", icon: "settings", permKey: "canManageBillingRoles" },
];

function getVisibleItems(permissions: UserPermissions | null): NavItem[] {
  if (!permissions) return allNavItems;
  return allNavItems.filter((item) => {
    if (!item.permKey) return true;
    return permissions[item.permKey];
  });
}

function isActive(href: string, currentPath: string): boolean {
  if (href === "/") return currentPath === "/";
  return currentPath === href || currentPath.startsWith(href + "/");
}

function NavIcon({ icon }: { icon: string }) {
  switch (icon) {
    case "chart-bar":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="20" y2="10" /><line x1="18" x2="18" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="16" /></svg>
      );
    case "folder":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" /></svg>
      );
    case "users":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
      );
    case "settings":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
      );
    default:
      return null;
  }
}

function SidebarInner() {
  const [collapsed, setCollapsed] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem(COLLAPSED_KEY) === "true"
      : false
  );

  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";

  const { data: user } = useQuery<CurrentUser>({
    queryKey: ["auth-me"],
    queryFn: async () => {
      const { data } = await apiClient.get("/auth/me/");
      return meResponseSchema.parse(data);
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const visibleItems = getVisibleItems(user?.permissions ?? null);

  useEffect(() => {
    localStorage.setItem(COLLAPSED_KEY, String(collapsed));
  }, [collapsed]);

  return (
    <aside
      className={`relative flex flex-col bg-[#1E293B] transition-all duration-300 flex-shrink-0 ${collapsed ? "w-[72px]" : "w-64"}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700/50">
        <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5Z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        {!collapsed && (
          <div>
            <h1 className="text-white font-bold text-sm leading-tight">Appix PM</h1>
            <p className="text-slate-400 text-[10px] leading-tight mt-0.5">Centro de Comando Financiero</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {visibleItems.map((item) => {
          const active = isActive(item.href, currentPath);
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-teal-500/15 text-teal-400"
                  : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                <NavIcon icon={item.icon} />
              </span>
              {!collapsed && <span>{item.label}</span>}
            </a>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mx-3 mb-4 flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:text-white hover:bg-slate-700/50 transition-all text-xs"
        aria-label="Contraer menu lateral"
      >
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
          className={`transition-transform duration-300 flex-shrink-0 ${collapsed ? "rotate-180" : ""}`}
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        {!collapsed && <span>Contraer</span>}
      </button>
    </aside>
  );
}

export default function Sidebar() {
  return (
    <QueryProvider>
      <SidebarInner />
    </QueryProvider>
  );
}

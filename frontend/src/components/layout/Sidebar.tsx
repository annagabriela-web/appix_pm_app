import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@services/apiClient";
import { meResponseSchema } from "@services/schemas";
import type { CurrentUser, UserPermissions } from "@types/auth";
import QueryProvider from "@components/providers/QueryProvider";

const COLLAPSED_KEY = "sidebar-collapsed";

const MONTH_PRESETS = [
  { label: "Ene 2026", from: "2026-01-01", to: "2026-01-31" },
  { label: "Feb 2026", from: "2026-02-01", to: "2026-02-28" },
  { label: "Ene-Feb", from: "2026-01-01", to: "2026-02-28" },
];

const TEAM_FILTERS = [
  { key: "", label: "Todos" },
  { key: "diseno", label: "Diseño" },
  { key: "sistemas", label: "Sistemas" },
  { key: "admin", label: "Admin" },
  { key: "hibrido", label: "Híbrido" },
];

interface NavItem {
  href: string;
  label: string;
  icon: string;
  permKey?: keyof UserPermissions;
}

const allNavItems: NavItem[] = [
  { href: "/", label: "Resumen General", icon: "chart-bar", permKey: "canSeePortfolio" },
  { href: "/analisis-financiero", label: "Análisis Financiero", icon: "coins", permKey: "canSeePortfolio" },
  { href: "/projects", label: "Proyectos Clientes", icon: "folder", permKey: "canSeeProjects" },
  { href: "/personal", label: "Proyectos Internos", icon: "building", permKey: "canSeePortfolio" },
  { href: "/recursos-humanos", label: "Recursos Humanos", icon: "users-group", permKey: "canSeePortfolio" },
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
    case "coins":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6" /><path d="M18.09 10.37A6 6 0 1 1 10.34 18" /><path d="M7 6h1v4" /><path d="m16.71 13.88.7.71-2.82 2.82" /></svg>
      );
    case "building":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" /><path d="M12 10h.01" /><path d="M12 14h.01" /><path d="M16 10h.01" /><path d="M16 14h.01" /><path d="M8 10h.01" /><path d="M8 14h.01" /></svg>
      );
    case "users-group":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 21a8 8 0 0 0-16 0" /><circle cx="10" cy="8" r="5" /><path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3" /></svg>
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
  const FILTER_PAGES = new Set(["/", "/analisis-financiero", "/recursos-humanos"]);
  const showFilters = FILTER_PAGES.has(currentPath);

  // Read filters from URL params
  const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const [dateFrom, setDateFrom] = useState(urlParams.get("dateFrom") || "");
  const [dateTo, setDateTo] = useState(urlParams.get("dateTo") || "");
  const [team, setTeam] = useState(urlParams.get("team") || "");

  function broadcastFilters(from: string, to: string, t: string) {
    setDateFrom(from);
    setDateTo(to);
    setTeam(t);
    const params = new URLSearchParams();
    if (from) params.set("dateFrom", from);
    if (to) params.set("dateTo", to);
    if (t) params.set("team", t);
    const qs = params.toString();
    window.history.replaceState({}, "", window.location.pathname + (qs ? `?${qs}` : ""));
    window.dispatchEvent(new CustomEvent("datefilter", { detail: { dateFrom: from, dateTo: to, team: t } }));
  }

  useEffect(() => {
    localStorage.setItem(COLLAPSED_KEY, String(collapsed));
  }, [collapsed]);

  return (
    <aside
      className={`relative flex flex-col bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0 ${collapsed ? "w-[72px]" : "w-60"}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
        <div className="w-8 h-8 bg-[#6278fb] rounded-lg flex items-center justify-center flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5Z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        {!collapsed && (
          <div>
            <h1 className="text-[#021b33] font-bold text-sm leading-tight">
              {user?.role === "DIRECTOR" ? "Super Admin" : user?.role === "ADMIN" ? "Admin" : user?.role === "PM" ? "Project Manager" : "Appix PM"}
            </h1>
            <p className="text-gray-400 text-[10px] leading-tight mt-0.5">Centro de Comando Financiero</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {visibleItems.map((item) => {
          const active = isActive(item.href, currentPath);
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-[#6278fb]/10 text-[#6278fb]"
                  : "text-gray-500 hover:bg-gray-50 hover:text-[#021b33]"
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

      {/* Filters — shown on dashboard pages */}
      {showFilters && !collapsed && (
        <div className="px-3 pb-3 border-t border-gray-100 pt-3 space-y-3">
          {/* Period presets */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Periodo</p>
            <div className="flex flex-wrap gap-1 px-1">
              {MONTH_PRESETS.map((p) => {
                const active = dateFrom === p.from && dateTo === p.to;
                return (
                  <button
                    key={p.label}
                    onClick={() => broadcastFilters(p.from, p.to, team)}
                    className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
                      active
                        ? "bg-[#6278fb]/10 text-[#6278fb]"
                        : "text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
              <button
                onClick={() => broadcastFilters("", "", team)}
                className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
                  !dateFrom && !dateTo
                    ? "bg-[#6278fb]/10 text-[#6278fb]"
                    : "text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                Todo
              </button>
            </div>
            {/* Custom date range */}
            <div className="flex gap-1.5 px-1 mt-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => broadcastFilters(e.target.value, dateTo, team)}
                className="flex-1 min-w-0 text-[10px] bg-gray-50 border border-gray-200 rounded-md px-1.5 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#6278fb]"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => broadcastFilters(dateFrom, e.target.value, team)}
                className="flex-1 min-w-0 text-[10px] bg-gray-50 border border-gray-200 rounded-md px-1.5 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#6278fb]"
              />
            </div>
          </div>

          {/* Team filter */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Equipo</p>
            <div className="flex flex-wrap gap-1 px-1">
              {TEAM_FILTERS.map((t) => {
                const active = team === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => broadcastFilters(dateFrom, dateTo, t.key)}
                    className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
                      active
                        ? "bg-[#6278fb]/10 text-[#6278fb]"
                        : "text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mx-3 mb-4 flex items-center gap-2 px-3 py-2 rounded-xl text-gray-400 hover:text-[#021b33] hover:bg-gray-50 transition-all text-xs"
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

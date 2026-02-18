import { useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import type { HealthStatus } from "@types/finance";
import { useProjects } from "@hooks/useProjects";
import { getHealthLabel } from "@services/formatters";
import QueryProvider from "@components/providers/QueryProvider";
import ProjectCard from "./ProjectCard";

type StatusFilter = HealthStatus | "ALL";

const TABS: { key: StatusFilter; label: string }[] = [
  { key: "ALL", label: "Todos" },
  { key: "HEALTHY", label: "En Camino" },
  { key: "WARNING", label: "En Riesgo" },
  { key: "CRITICAL", label: "Critico" },
];

function ProjectsGridInner() {
  const [activeTab, setActiveTab] = useState<StatusFilter>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useProjects();
  const allProjects = data?.results ?? [];

  const filtered = allProjects.filter((p) => {
    const matchesStatus =
      activeTab === "ALL" || p.currentHealthStatus === activeTab;
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(searchLower) ||
      p.clientName.toLowerCase().includes(searchLower);
    return matchesStatus && matchesSearch;
  });

  const countByStatus = (status: StatusFilter) =>
    status === "ALL"
      ? allProjects.length
      : allProjects.filter((p) => p.currentHealthStatus === status).length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-9 w-24 bg-gray-200 rounded-full animate-pulse"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse h-56"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls row */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-xs">
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
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar proyectos o clientes..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              aria-label="Filtrar proyectos"
            />
          </div>
          <select
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-neutral focus:outline-none focus:ring-2 focus:ring-primary/30"
            aria-label="Filtrar por tipo"
          >
            <option>Todos los Proyectos</option>
          </select>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "grid"
                ? "bg-white shadow-sm text-gray-900"
                : "text-neutral hover:text-gray-900"
            }`}
            aria-label="Vista cuadricula"
            aria-pressed={viewMode === "grid"}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "list"
                ? "bg-white shadow-sm text-gray-900"
                : "text-neutral hover:text-gray-900"
            }`}
            aria-label="Vista lista"
            aria-pressed={viewMode === "list"}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map((tab) => {
          const count = countByStatus(tab.key);
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? "bg-gray-900 text-white"
                  : "bg-white border border-gray-200 text-neutral hover:border-gray-400"
              }`}
              aria-pressed={isActive}
            >
              {tab.label}
              <span
                className={`ml-1.5 text-xs ${isActive ? "text-gray-300" : "text-neutral"}`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-neutral text-sm">
          No se encontraron proyectos
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {filtered.map((project) => {
            const statusClasses =
              project.currentHealthStatus === "HEALTHY"
                ? "bg-emerald-100 text-emerald-700"
                : project.currentHealthStatus === "WARNING"
                  ? "bg-orange-100 text-orange-700"
                  : "bg-red-100 text-red-700";
            return (
              <a
                key={project.id}
                href={`/projects/${project.id}`}
                className="flex items-center gap-4 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {project.name}
                  </p>
                  <p className="text-xs text-neutral">{project.clientName}</p>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusClasses}`}
                >
                  {getHealthLabel(project.currentHealthStatus)}
                </span>
                <span className="text-xs text-primary">Detalle</span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ProjectsGrid() {
  return (
    <QueryProvider>
      <ProjectsGridInner />
    </QueryProvider>
  );
}

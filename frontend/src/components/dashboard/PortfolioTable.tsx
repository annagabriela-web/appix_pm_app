import { useState } from "react";

import type { HealthStatus, PortfolioProject } from "@types/finance";

import { usePortfolio } from "@hooks/usePortfolio";
import { formatHours, formatPercent } from "@services/formatters";

import QueryProvider from "@components/providers/QueryProvider";

import StatusBadge from "./StatusBadge";

type SortField = "name" | "consumptionPercent" | "progressPercent" | "deviation";
type SortDir = "asc" | "desc";

function PortfolioTableInner() {
  const { data, isLoading } = usePortfolio();
  const [filter, setFilter] = useState<HealthStatus | "ALL">("ALL");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-neutral">
        No hay proyectos registrados
      </div>
    );
  }

  const filtered =
    filter === "ALL"
      ? data
      : data.filter((p) => p.currentHealthStatus === filter);

  const sorted = [...filtered].sort((a, b) => {
    let valA: string | number;
    let valB: string | number;

    if (sortField === "name") {
      valA = a.name;
      valB = b.name;
    } else {
      valA = parseFloat(a[sortField]);
      valB = parseFloat(b[sortField]);
    }

    if (valA < valB) return sortDir === "asc" ? -1 : 1;
    if (valA > valB) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIndicator = ({ field }: { field: SortField }) =>
    sortField === field ? (
      <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>
    ) : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Filter bar */}
      <div className="p-4 border-b border-gray-100 flex gap-2">
        {(["ALL", "CRITICAL", "WARNING", "HEALTHY"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === status
                ? "bg-primary text-white"
                : "bg-gray-100 text-neutral hover:bg-gray-200"
            }`}
          >
            {status === "ALL" ? "Todos" : status}
            {status !== "ALL" && (
              <span className="ml-1">
                ({data.filter((p) => p.currentHealthStatus === status).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th
                className="text-left px-4 py-3 text-xs font-semibold text-neutral uppercase tracking-wide cursor-pointer hover:text-gray-900"
                onClick={() => handleSort("name")}
              >
                Proyecto <SortIndicator field="name" />
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral uppercase tracking-wide">
                Cliente
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-neutral uppercase tracking-wide">
                Estado
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-neutral uppercase tracking-wide">
                Presupuesto
              </th>
              <th
                className="text-right px-4 py-3 text-xs font-semibold text-neutral uppercase tracking-wide cursor-pointer hover:text-gray-900"
                onClick={() => handleSort("consumptionPercent")}
              >
                Consumido <SortIndicator field="consumptionPercent" />
              </th>
              <th
                className="text-right px-4 py-3 text-xs font-semibold text-neutral uppercase tracking-wide cursor-pointer hover:text-gray-900"
                onClick={() => handleSort("progressPercent")}
              >
                Progreso <SortIndicator field="progressPercent" />
              </th>
              <th
                className="text-right px-4 py-3 text-xs font-semibold text-neutral uppercase tracking-wide cursor-pointer hover:text-gray-900"
                onClick={() => handleSort("deviation")}
              >
                Desviacion <SortIndicator field="deviation" />
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((project) => (
              <tr
                key={project.id}
                className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                  project.currentHealthStatus === "CRITICAL"
                    ? "bg-critical/5"
                    : project.currentHealthStatus === "WARNING"
                      ? "bg-warning/5"
                      : ""
                }`}
              >
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900">{project.name}</p>
                    <p className="text-xs text-neutral">{project.code}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {project.clientName}
                </td>
                <td className="px-4 py-3 text-center">
                  <StatusBadge status={project.currentHealthStatus} size="sm" />
                </td>
                <td className="px-4 py-3 text-right financial-number text-gray-900">
                  {formatHours(project.budgetHours)}
                </td>
                <td className="px-4 py-3 text-right financial-number text-gray-900">
                  {formatHours(project.consumedHours)}{" "}
                  <span className="text-neutral text-xs">
                    ({formatPercent(project.consumptionPercent)})
                  </span>
                </td>
                <td className="px-4 py-3 text-right financial-number text-gray-900">
                  {formatPercent(project.progressPercent)}
                </td>
                <td className="px-4 py-3 text-right financial-number">
                  <span
                    className={
                      parseFloat(project.deviation) > 15
                        ? "text-critical font-semibold"
                        : parseFloat(project.deviation) > 10
                          ? "text-warning"
                          : "text-healthy"
                    }
                  >
                    {formatPercent(project.deviation)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <a
                    href={`/projects/${project.id}`}
                    className="text-primary text-xs hover:underline"
                  >
                    Detalle
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function PortfolioTable() {
  return (
    <QueryProvider>
      <PortfolioTableInner />
    </QueryProvider>
  );
}

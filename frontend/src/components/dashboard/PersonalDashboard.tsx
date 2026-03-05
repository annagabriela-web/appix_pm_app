import { useState } from "react";
import { Search, AlertTriangle, CheckCircle2, FileWarning, Users } from "lucide-react";
import type { PersonalMember } from "@types/finance";
import { usePersonal } from "@hooks/usePersonal";
import QueryProvider from "@components/providers/QueryProvider";

// ── Category colors ────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  DAILYS: "#94a3b8",
  VENTAS: "#ef4444",
  CAPACITACION: "#00e7ba",
  INNOVACION: "#6278fb",
  HR_ADMIN: "#f59e0b",
  GESTION: "#67adee",
  TI: "#021b33",
  DISENO: "#ec4899",
  OTHER: "#cbd5e1",
};

// ── Person Card ────────────────────────────────────────────────

function PersonCard({ member }: { member: PersonalMember }) {
  const [expanded, setExpanded] = useState(false);
  const total = parseFloat(member.totalHours);
  const client = parseFloat(member.clientHours);
  const internal = parseFloat(member.internalHours);
  const productive = parseFloat(member.productiveHours);
  const nonProd = parseFloat(member.nonProductiveHours);
  const productivePct = total > 0 ? (productive / total) * 100 : 0;
  const clientPct = total > 0 ? (client / total) * 100 : 0;

  const dq = member.dataQuality;
  const hasSuspicious = member.suspiciousEntries.length > 0;
  const hasQualityIssues = dq.missingDescription > 0 || dq.clientEntriesWithoutJira > 0 || hasSuspicious;

  // Short name
  const shortName = member.name.split(" ").slice(0, 2).join(" ");

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">{shortName}</h4>
            <p className="text-xs text-slate-400 mt-0.5">{total.toFixed(1)}h registradas</p>
          </div>
          {hasQualityIssues && (
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${
              hasSuspicious ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"
            }`}>
              <AlertTriangle className={`w-3 h-3 ${hasSuspicious ? "text-red-500" : "text-amber-500"}`} />
              <span className={`text-[10px] font-medium ${hasSuspicious ? "text-red-600" : "text-amber-600"}`}>
                {dq.missingDescription + dq.clientEntriesWithoutJira + member.suspiciousEntries.length}
              </span>
            </div>
          )}
        </div>

        {/* Productivity ring — simplified as bar */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="text-slate-500">Productivo</span>
              <span className="font-semibold text-gray-700">{productivePct.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${productivePct}%`,
                  backgroundColor: productivePct >= 75 ? "#00e7ba" : productivePct >= 50 ? "#f59e0b" : "#ef4444",
                }}
              />
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400">No prod.</div>
            <div className="text-xs font-semibold text-slate-600">{nonProd.toFixed(1)}h</div>
          </div>
        </div>

        {/* Client vs Internal split */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-emerald-50 rounded-lg p-2 text-center">
            <div className="text-xs font-bold text-emerald-700">{client.toFixed(1)}h</div>
            <div className="text-[10px] text-emerald-500">Cliente ({clientPct.toFixed(0)}%)</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-2 text-center">
            <div className="text-xs font-bold text-slate-700">{internal.toFixed(1)}h</div>
            <div className="text-[10px] text-slate-500">Interno ({(100 - clientPct).toFixed(0)}%)</div>
          </div>
        </div>

        {/* Internal breakdown bars */}
        {member.internalBreakdown.length > 0 && (
          <div className="space-y-1.5 mb-3">
            <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">
              Desglose Interno
            </div>
            {member.internalBreakdown.map((item) => {
              const hrs = parseFloat(item.hours);
              const pct = internal > 0 ? (hrs / internal) * 100 : 0;
              const color = CATEGORY_COLORS[item.category] || "#cbd5e1";
              return (
                <div key={item.category} className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-[11px] text-slate-600 flex-1 truncate">
                    {item.categoryLabel}
                  </span>
                  <span className="text-[11px] font-medium text-slate-700">
                    {hrs.toFixed(1)}h
                  </span>
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Toggle details */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-center text-[10px] text-blue-500 hover:text-blue-700 py-1"
        >
          {expanded ? "Ocultar detalle" : "Ver detalle"}
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 p-4 pt-3 space-y-3 bg-slate-50/50">
          {/* Client projects */}
          {member.clientProjects.length > 0 && (
            <div>
              <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                Proyectos Cliente
              </div>
              <div className="space-y-1">
                {member.clientProjects.map((proj) => (
                  <div
                    key={proj.id}
                    className="flex items-center justify-between bg-white rounded-md px-2.5 py-1.5 text-xs"
                  >
                    <div className="flex items-center gap-1.5">
                      {proj.hasJiraKey ? (
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                      )}
                      <span className="font-medium text-gray-800">{proj.name}</span>
                      <span className="text-slate-400">({proj.code})</span>
                    </div>
                    <span className="font-semibold text-gray-700">{parseFloat(proj.hours).toFixed(1)}h</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data quality */}
          {hasQualityIssues && (
            <div>
              <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                Calidad de Datos
              </div>
              <div className="space-y-1">
                {dq.missingDescription > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 rounded-md px-2.5 py-1.5">
                    <FileWarning className="w-3 h-3" />
                    <span>{dq.missingDescription} entradas sin descripción</span>
                    <span className="text-amber-400 text-[10px]">
                      ({((dq.missingDescription / dq.totalEntries) * 100).toFixed(0)}%)
                    </span>
                  </div>
                )}
                {dq.clientEntriesWithoutJira > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 rounded-md px-2.5 py-1.5">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{dq.clientEntriesWithoutJira} entradas cliente sin Jira key</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Suspicious entries — internal with non-internal Jira keys */}
          {member.suspiciousEntries.length > 0 && (
            <div>
              <div className="text-[10px] font-medium text-red-500 uppercase tracking-wide mb-1.5">
                Registros Sospechosos ({member.suspiciousEntries.length})
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {member.suspiciousEntries.map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-red-50 rounded-md px-2.5 py-1.5 text-[11px]"
                  >
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <span className="font-mono font-semibold text-red-600 flex-shrink-0">
                        {entry.jiraKey}
                      </span>
                      <span className="text-slate-500 truncate">{entry.description}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className="text-[10px] text-slate-400">{entry.projectCode}</span>
                      <span className="font-medium text-red-600">{parseFloat(entry.hours).toFixed(1)}h</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────

function PersonalDashboardInner() {
  const [search, setSearch] = useState("");
  const { data, isLoading, isError } = usePersonal();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
            <div className="h-3 bg-gray-100 rounded w-1/3 mb-4" />
            <div className="h-2 bg-gray-100 rounded-full mb-3" />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-12 bg-gray-100 rounded-lg" />
              <div className="h-12 bg-gray-100 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-red-500 text-sm font-medium">Error al cargar datos del personal</p>
      </div>
    );
  }

  const members = data.members;
  const filtered = members.filter((m) => {
    if (!search) return true;
    return m.name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-slate-500">Miembros</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{data.summary.totalMembers}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-xs text-slate-500">Productividad Promedio</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {parseFloat(data.summary.avgProductivePercent).toFixed(0)}%
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-4 rounded-full bg-emerald-400" />
            <span className="text-xs text-slate-500">% Horas Cliente</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {parseFloat(data.summary.avgClientPercent).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar persona..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((member) => (
          <PersonCard key={member.name} member={member} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400 text-sm">
          No se encontraron resultados
        </div>
      )}
    </div>
  );
}

export default function PersonalDashboard() {
  return (
    <QueryProvider>
      <PersonalDashboardInner />
    </QueryProvider>
  );
}

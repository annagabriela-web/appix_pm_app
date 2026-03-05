import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, Target, CreditCard, Droplets, Briefcase } from "lucide-react";
import { useCeoDashboard } from "@hooks/useCeoDashboard";
import QueryProvider from "@components/providers/QueryProvider";
import TeamUtilizationDonut from "@components/charts/TeamUtilizationDonut";
import HourComplianceHeatmap from "@components/charts/HourComplianceHeatmap";
import { TEAMS, TEAM_KEYS, PART_TIME_PERSONS, type TeamKey } from "@components/charts/teamConfig";

function formatMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toLocaleString("es-MX", { maximumFractionDigits: 0 })}`;
}

function CeoDashboardInner() {
  // Read initial filters from URL params (set by Sidebar)
  const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const [dateFrom, setDateFrom] = useState(urlParams.get("dateFrom") || "");
  const [dateTo, setDateTo] = useState(urlParams.get("dateTo") || "");
  const [teamFilter, setTeamFilter] = useState(urlParams.get("team") || "");
  const [expandedGeneral, setExpandedGeneral] = useState(false);

  // Listen for filter changes from Sidebar
  useEffect(() => {
    function handleFilter(e: Event) {
      const d = (e as CustomEvent).detail;
      setDateFrom(d.dateFrom);
      setDateTo(d.dateTo);
      setTeamFilter(d.team ?? "");
    }
    window.addEventListener("datefilter", handleFilter);
    return () => window.removeEventListener("datefilter", handleFilter);
  }, []);

  const params = {
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {}),
  };

  const { data, isLoading, error } = useCeoDashboard(
    Object.keys(params).length > 0 ? params : undefined
  );
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
              <div className="h-3 w-20 bg-gray-200 rounded mb-3" />
              <div className="h-6 w-28 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
        <AlertTriangle size={24} className="text-red-400 mx-auto mb-2" />
        <p className="text-sm text-red-600">Error al cargar el dashboard ejecutivo</p>
      </div>
    );
  }

  const { revenue, health } = data;

  // Team filter: get allowed person names (lowercase)
  const teamMembers = teamFilter && TEAMS[teamFilter as TeamKey]
    ? new Set(TEAMS[teamFilter as TeamKey].members)
    : null;
  const isPersonAllowed = (name: string) => !teamMembers || teamMembers.has(name.toLowerCase());

  const filteredUtilization = teamMembers
    ? data.teamUtilization.filter((p) => isPersonAllowed(p.name))
    : data.teamUtilization;
  const filteredFlow = teamMembers
    ? data.teamFlow.filter((f) => isPersonAllowed(f.person))
    : data.teamFlow;
  const filteredCompliance = teamMembers
    ? data.hourCompliance.filter((e) => isPersonAllowed(e.name))
    : data.hourCompliance;

  const contracted = parseFloat(revenue.totalContracted);
  const collected = parseFloat(revenue.totalCollected);
  const collectedPct = contracted > 0 ? (collected / contracted * 100).toFixed(0) : "0";

  const overdueCount = data.overdueInvoices?.count ?? 0;
  const overdueAmount = parseFloat(data.overdueInvoices?.totalAmount ?? "0");

  return (
    <div className="space-y-4">
      {/* KPI Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Block 1: Financiero */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Financiero</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <DollarSign size={12} className="text-slate-400" />
                <span className="text-[10px] font-medium text-slate-500 uppercase">Ingresos</span>
              </div>
              <p className={`text-lg font-bold ${contracted > 0 ? "text-gray-900" : "text-slate-400"}`}>{formatMoney(contracted)}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{formatMoney(collected)} cobrado</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Droplets size={12} className="text-slate-400" />
                <span className="text-[10px] font-medium text-slate-500 uppercase">Liquidez</span>
              </div>
              <p className="text-lg font-bold text-slate-300">--</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Próximamente</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Target size={12} className="text-slate-400" />
                <span className="text-[10px] font-medium text-slate-500 uppercase">ARR</span>
              </div>
              <p className="text-lg font-bold text-slate-300">--</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Próximamente</p>
            </div>
          </div>
        </div>

        {/* Block 2: Operativo */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Operativo</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Briefcase size={12} className="text-slate-400" />
                <span className="text-[10px] font-medium text-slate-500 uppercase">Proyectos Activos</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{health.totalProjects}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-0.5">
                {health.critical > 0 && <TrendingDown size={9} className="text-red-500" />}
                {health.critical} en riesgo
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <CreditCard size={12} className="text-slate-400" />
                <span className="text-[10px] font-medium text-slate-500 uppercase">Tasa de Cobro</span>
              </div>
              <p className={`text-lg font-bold ${parseFloat(collectedPct) > 50 ? "text-[#00e7ba]" : "text-amber-600"}`}>{collectedPct}%</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{formatMoney(collected)} / {formatMoney(contracted)}</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <AlertTriangle size={12} className="text-slate-400" />
                <span className="text-[10px] font-medium text-slate-500 uppercase">Pagos Atrasados</span>
              </div>
              <p className={`text-lg font-bold ${overdueCount > 0 ? "text-red-600" : "text-[#00e7ba]"}`}>
                {overdueCount > 0 ? formatMoney(overdueAmount) : "$0"}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-0.5">
                {overdueCount > 0 ? <TrendingDown size={9} className="text-red-500" /> : <TrendingUp size={9} className="text-[#00e7ba]" />}
                {overdueCount > 0 ? `${overdueCount} facturas` : "Al corriente"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Development Goals */}
      {(() => {
        const clientH = parseFloat(data.developmentSummary?.totalClientHours || "0");
        const internalH = parseFloat(data.developmentSummary?.totalInternalHours || "0");
        const totalH = clientH + internalH;
        const clientPct = totalH > 0 ? (clientH / totalH * 100) : 0;
        const internalPct = totalH > 0 ? (internalH / totalH * 100) : 0;

        // Expected hours for the whole team in the period
        const months = [...new Set(filteredCompliance.map((e) => e.month))];
        const workingDaysPerMonth = months.map((m) => {
          const [y, mo] = m.split("-").map(Number);
          const lastDay = new Date(y, mo, 0).getDate();
          let days = 0;
          for (let d = 1; d <= lastDay; d++) {
            const dow = new Date(y, mo - 1, d).getDay();
            if (dow !== 0 && dow !== 6) days++;
          }
          return days;
        });
        const totalWorkingDays = workingDaysPerMonth.reduce((s, d) => s + d, 0);
        const allMembers = TEAM_KEYS.flatMap((k) => TEAMS[k].members);
        const fullTimeCount = allMembers.filter((m) => !PART_TIME_PERSONS.has(m)).length;
        const partTimeCount = allMembers.filter((m) => PART_TIME_PERSONS.has(m)).length;
        const expectedH = totalWorkingDays * (fullTimeCount * 8 + partTimeCount * 4);
        const registrationPct = expectedH > 0 ? (totalH / expectedH * 100) : 0;
        const gapH = Math.max(0, expectedH - totalH);

        const CATEGORY_COLORS: Record<string, { color: string; icon: string; isNP?: boolean }> = {
          DAILYS:           { color: "#94a3b8", icon: "📋", isNP: true },
          VENTAS:           { color: "#ef4444", icon: "💰" },
          REUNIONES:        { color: "#8b5cf6", icon: "🗓️", isNP: true },
          INNOVACION:       { color: "#6278fb", icon: "💡" },
          CAPACITACION:     { color: "#00e7ba", icon: "📚" },
          TTM:              { color: "#021b33", icon: "⚡" },
          AI_AGENTS:        { color: "#ec4899", icon: "🤖" },
          ESTANDARIZACION:  { color: "#f59e0b", icon: "🧩" },
          APPIX_GENERAL:    { color: "#67adee", icon: "🏢" },
        };

        const goals = data.developmentGoals || [];
        // Sum of all classified internal hours
        const classifiedTotal = goals.reduce((s, g) => s + parseFloat(g.hours), 0);

        return (<>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <Target size={14} className="text-[#6278fb]" />
            Objetivos de Desarrollo
          </h3>
          <p className="text-[11px] text-slate-400 mb-4">
            Inversión de horas en iniciativas internas del período
          </p>

          <div className="grid grid-cols-2 gap-6">
            {/* Left: All goal categories from API */}
            <div className="space-y-2">
              {goals.map((goal) => {
                const hrs = parseFloat(goal.hours);
                const pct = classifiedTotal > 0 ? (hrs / classifiedTotal) * 100 : 0;
                const cfg = CATEGORY_COLORS[goal.category] || { color: "#cbd5e1", icon: "📊" };
                const isExpanded = goal.category === "APPIX_GENERAL" && expandedGeneral;
                return (
                  <div key={goal.category}>
                    <div
                      className={`flex items-center gap-2.5 ${goal.category === "APPIX_GENERAL" && goal.personBreakdown ? "cursor-pointer hover:bg-gray-50 -mx-1 px-1 rounded-lg" : ""}`}
                      onClick={() => {
                        if (goal.category === "APPIX_GENERAL" && goal.personBreakdown) {
                          setExpandedGeneral(!expandedGeneral);
                        }
                      }}
                    >
                      <span className="text-sm flex-shrink-0">{cfg.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[11px] font-medium text-gray-700 truncate flex items-center gap-1">
                            {goal.categoryLabel}
                            {cfg.isNP && goal.hasData && (
                              <span className="text-[7px] px-1 py-px rounded bg-slate-100 text-slate-400">NP</span>
                            )}
                            {goal.category === "APPIX_GENERAL" && goal.personBreakdown && (
                              <svg className={`w-3 h-3 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                              </svg>
                            )}
                          </span>
                          {goal.hasData ? (
                            <span className="text-[10px] font-semibold text-gray-600 ml-2 whitespace-nowrap">
                              {hrs.toFixed(0)}h
                              <span className="text-gray-400 font-normal ml-1">({pct.toFixed(0)}%)</span>
                            </span>
                          ) : (
                            <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 whitespace-nowrap">
                              Pendiente
                            </span>
                          )}
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(pct, 100)}%`,
                              backgroundColor: cfg.color,
                              opacity: cfg.isNP ? 0.45 : 1,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    {/* Expandable person breakdown for APPIX_GENERAL */}
                    {isExpanded && goal.personBreakdown && (
                      <div className="ml-7 mt-1 mb-1 space-y-1 border-l-2 border-gray-100 pl-2.5">
                        {goal.personBreakdown.map((p) => (
                          <div key={p.name} className="flex items-center justify-between text-[10px]">
                            <span className="text-gray-600">{p.name}</span>
                            <span className="font-medium text-gray-500">{parseFloat(p.hours).toFixed(0)}h</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right: Period summary — Expected vs Actual */}
            <div className="space-y-3">
              {/* Registered vs Expected */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-[10px] text-gray-500">Horas Registradas</span>
                  <span className="text-[10px] text-gray-400">de {expectedH.toFixed(0)}h esperadas</span>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-bold text-gray-800">{totalH.toFixed(0)}h</span>
                  <span className={`text-sm font-bold ${registrationPct >= 90 ? "text-[#00e7ba]" : registrationPct >= 75 ? "text-[#f59e0b]" : "text-[#ef4444]"}`}>
                    {Math.round(registrationPct)}%
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden relative">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(registrationPct, 100)}%`,
                      backgroundColor: registrationPct >= 90 ? "#00e7ba" : registrationPct >= 75 ? "#f59e0b" : "#ef4444",
                    }}
                  />
                </div>
                {gapH > 0 && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
                    <span className="text-[10px] text-[#ef4444] font-medium">
                      {gapH.toFixed(0)}h sin registrar ({(100 - registrationPct).toFixed(0)}%)
                    </span>
                  </div>
                )}
              </div>

              {/* Client vs Internal distribution */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#021b33]/5 rounded-lg p-2.5 text-center">
                  <div className="text-lg font-bold text-[#021b33]">{Math.round(clientPct)}%</div>
                  <div className="text-[9px] text-gray-500">{clientH.toFixed(0)}h Cliente</div>
                </div>
                <div className="bg-[#67adee]/10 rounded-lg p-2.5 text-center">
                  <div className="text-lg font-bold text-[#67adee]">{Math.round(internalPct)}%</div>
                  <div className="text-[9px] text-gray-500">{internalH.toFixed(0)}h Interno</div>
                </div>
              </div>

              {/* Proportion bar */}
              <div>
                <div className="flex h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#021b33]" style={{ width: `${clientPct}%` }} />
                  <div className="h-full bg-[#67adee]" style={{ width: `${internalPct}%` }} />
                </div>
                <div className="flex justify-between mt-1 text-[9px] text-gray-400">
                  <span>Cliente {Math.round(clientPct)}%</span>
                  <span>Interno {Math.round(internalPct)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Quality Alerts */}
        {data.dataQualityAlerts && data.dataQualityAlerts.length > 0 && (
          <div className="bg-amber-50/50 rounded-xl border border-amber-200/60 p-4">
            <h4 className="text-[11px] font-semibold text-amber-700 uppercase mb-2 flex items-center gap-1.5">
              <AlertTriangle size={12} />
              Alertas de Calidad de Datos
            </h4>
            <div className="space-y-1">
              {data.dataQualityAlerts.map((alert, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] text-amber-800 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 mt-1" />
                  <span>{alert.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        </>);
      })()}

      {/* Hour Compliance Heatmap */}
      {filteredCompliance.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <HourComplianceHeatmap data={filteredCompliance} />
        </div>
      )}

      {/* Team Utilization */}
      {filteredUtilization.length > 0 && (() => {
        const compMonths = [...new Set(filteredCompliance.map((e) => e.month))];
        const totalExpectedHours = compMonths.reduce((sum, m) => {
          const [y, mo] = m.split("-").map(Number);
          const lastDay = new Date(y, mo, 0).getDate();
          let days = 0;
          for (let d = 1; d <= lastDay; d++) {
            const dow = new Date(y, mo - 1, d).getDay();
            if (dow !== 0 && dow !== 6) days++;
          }
          return sum + days * 8;
        }, 0) || 336;

        return (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <TeamUtilizationDonut
              data={filteredUtilization}
              flow={filteredFlow}
              totalExpectedHours={totalExpectedHours}
            />
          </div>
        );
      })()}

    </div>
  );
}

export default function CeoDashboard() {
  return (
    <QueryProvider>
      <CeoDashboardInner />
    </QueryProvider>
  );
}

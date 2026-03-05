import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { useCeoDashboard } from "@hooks/useCeoDashboard";
import QueryProvider from "@components/providers/QueryProvider";
import TeamUtilizationDonut from "@components/charts/TeamUtilizationDonut";
import HourComplianceHeatmap from "@components/charts/HourComplianceHeatmap";
import { TEAMS, TEAM_KEYS, type TeamKey } from "@components/charts/teamConfig";

function RecursosHumanosInner() {
  const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const [dateFrom, setDateFrom] = useState(urlParams.get("dateFrom") || "");
  const [dateTo, setDateTo] = useState(urlParams.get("dateTo") || "");
  const [teamFilter, setTeamFilter] = useState(urlParams.get("team") || "");

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
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-48" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
        <AlertTriangle size={24} className="text-red-400 mx-auto mb-2" />
        <p className="text-sm text-red-600">Error al cargar datos de recursos humanos</p>
      </div>
    );
  }

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

  // Calculate total expected hours from compliance months
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
    <div className="space-y-4">
      {/* Team Utilization Cards */}
      {filteredUtilization.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <TeamUtilizationDonut
            data={filteredUtilization}
            flow={filteredFlow}
            totalExpectedHours={totalExpectedHours}
          />
        </div>
      )}

      {/* Hour Compliance Heatmap */}
      {filteredCompliance.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <HourComplianceHeatmap data={filteredCompliance} />
        </div>
      )}
    </div>
  );
}

export default function RecursosHumanosDashboard() {
  return (
    <QueryProvider>
      <RecursosHumanosInner />
    </QueryProvider>
  );
}

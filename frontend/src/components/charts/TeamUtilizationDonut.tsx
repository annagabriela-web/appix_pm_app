import { useMemo, useState } from "react";
import type { TeamUtilizationMember, TeamFlowLink } from "@types/finance";
import {
  TEAMS, TEAM_KEYS, PART_TIME_PERSONS,
  getTeamForPerson, getComplianceColor,
  type TeamKey,
} from "./teamConfig";

interface Props {
  data: TeamUtilizationMember[];
  flow: TeamFlowLink[];
  totalExpectedHours: number;
}

function shortName(name: string): string {
  const parts = name.split(" ");
  if (parts.length >= 2) return `${parts[0]} ${parts[1].charAt(0)}.`;
  return name;
}

interface SelectedPerson {
  name: string;
  team: TeamKey;
  teamLabel: string;
  client: number;
  internal: number;
  total: number;
  compliancePct: number;
  isPartTime: boolean;
  expectedHours: number;
  clientProjects: { project: string; hours: number }[];
  internalProjects: { project: string; hours: number }[];
}

interface SelectedTeam {
  key: TeamKey;
  label: string;
  totalHours: number;
  clientHours: number;
  internalHours: number;
  compliancePct: number;
  memberCount: number;
  members: { name: string; total: number; compliancePct: number }[];
}

type Selection =
  | { type: "person"; data: SelectedPerson }
  | { type: "team"; data: SelectedTeam }
  | null;

/** Teams where client/internal balance matters */
const BALANCE_TEAMS: TeamKey[] = ["diseno", "sistemas"];

function getClientBarColor(clientPct: number, team?: TeamKey): string {
  if (team && !BALANCE_TEAMS.includes(team)) return "#021b33";
  if (clientPct >= 50) return "#021b33";
  if (clientPct >= 40) return "#f59e0b";
  return "#ef4444";
}

function getInternalBarColor(internalPct: number, team?: TeamKey): string {
  if (team && !BALANCE_TEAMS.includes(team)) return "#67adee";
  if (internalPct <= 50) return "#67adee";
  if (internalPct <= 60) return "#f59e0b";
  return "#6278fb";
}

function getBalanceLabel(clientPct: number, team?: TeamKey): { text: string; color: string } {
  if (team && !BALANCE_TEAMS.includes(team)) return { text: "Rol Interno", color: "#64748b" };
  if (clientPct >= 50) return { text: "Balanceado", color: "#021b33" };
  if (clientPct >= 40) return { text: "Alerta", color: "#f59e0b" };
  return { text: "Crítico", color: "#ef4444" };
}

interface PersonNode {
  name: string;
  team: TeamKey;
  client: number;
  internal: number;
  total: number;
  compliancePct: number;
  isPartTime: boolean;
  expectedHours: number;
  clientProjects: { project: string; hours: number }[];
  internalProjects: { project: string; hours: number }[];
}

interface TeamNode {
  key: TeamKey;
  label: string;
  totalHours: number;
  totalExpected: number;
  compliancePct: number;
  clientHours: number;
  internalHours: number;
  memberCount: number;
  members: PersonNode[];
}

export default function TeamUtilizationDonut({ data, flow, totalExpectedHours }: Props) {
  const [selection, setSelection] = useState<Selection>(null);

  const { teams, grandTotal } = useMemo(() => {
    const personData: PersonNode[] = data.map((m) => {
      const internal = parseFloat(m.internalHours);
      const client = parseFloat(m.clientHours);
      const total = internal + client;
      const team = getTeamForPerson(m.name);
      const isPartTime = PART_TIME_PERSONS.has(m.name.toLowerCase());
      const expectedHours = isPartTime ? totalExpectedHours / 2 : totalExpectedHours;
      const compliancePct = expectedHours > 0 ? (total / expectedHours) * 100 : 0;

      const personFlow = flow.filter(
        (f) => f.person.toLowerCase() === m.name.toLowerCase()
      );
      const clientProjects = personFlow
        .filter((f) => !f.isInternal)
        .map((f) => ({ project: f.project, hours: parseFloat(f.hours) }))
        .sort((a, b) => b.hours - a.hours);
      const internalProjects = personFlow
        .filter((f) => f.isInternal)
        .map((f) => ({ project: f.project, hours: parseFloat(f.hours) }))
        .sort((a, b) => b.hours - a.hours);

      return {
        name: m.name, team: team ?? ("hibrido" as TeamKey),
        internal, client, total, compliancePct,
        isPartTime, expectedHours, clientProjects, internalProjects,
      };
    });

    const teams: TeamNode[] = TEAM_KEYS.map((key) => {
      const members = personData.filter((p) => p.team === key).sort((a, b) => b.total - a.total);
      const totalHours = members.reduce((s, m) => s + m.total, 0);
      const totalExpected = members.reduce((s, m) => s + m.expectedHours, 0);
      const compliancePct = totalExpected > 0 ? (totalHours / totalExpected) * 100 : 0;
      const clientHours = members.reduce((s, m) => s + m.client, 0);
      const internalHours = members.reduce((s, m) => s + m.internal, 0);
      return { key, label: TEAMS[key].label, members, totalHours, totalExpected, compliancePct, clientHours, internalHours, memberCount: members.length };
    });

    const grandTotal = teams.reduce((s, t) => s + t.totalHours, 0);
    return { teams, grandTotal };
  }, [data, flow, totalExpectedHours]);

  const [expandedTeam, setExpandedTeam] = useState<TeamKey | null>(null);

  const handleTeamClick = (team: TeamNode) => {
    setExpandedTeam(expandedTeam === team.key ? null : team.key);
    setSelection(null);
  };

  const handlePersonClick = (p: PersonNode) => {
    setSelection({
      type: "person",
      data: {
        name: p.name,
        team: p.team,
        teamLabel: TEAMS[p.team].label,
        client: p.client,
        internal: p.internal,
        total: p.total,
        compliancePct: p.compliancePct,
        isPartTime: p.isPartTime,
        expectedHours: p.expectedHours,
        clientProjects: p.clientProjects,
        internalProjects: p.internalProjects,
      },
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-gray-900">
          Utilización por Equipo
        </h3>
      </div>

      {/* 4 Team cards grid */}
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        {teams.map((team) => {
          const compColor = getComplianceColor(team.compliancePct);
          const isExpanded = expandedTeam === team.key;
          const clientPct = team.totalHours > 0 ? (team.clientHours / team.totalHours * 100) : 0;
          const usedPct = Math.min(team.compliancePct, 100);
          const isOver = team.compliancePct > 100;
          const clientBarW = team.totalExpected > 0 ? (team.clientHours / team.totalExpected * 100) : 0;
          const internalBarW = team.totalExpected > 0 ? (team.internalHours / team.totalExpected * 100) : 0;

          return (
            <button
              key={team.key}
              onClick={() => handleTeamClick(team)}
              className={`relative bg-white border rounded-xl p-3.5 text-left transition-all ${
                isExpanded
                  ? "border-gray-300 shadow-md ring-1 ring-gray-200"
                  : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              {/* Compliance color accent */}
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ backgroundColor: compColor }} />

              {/* Header: name + members */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-gray-800">{team.label}</span>
                  <span className="text-[9px] text-gray-400">({team.memberCount})</span>
                </div>
                <svg
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Hero compliance % */}
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-2xl font-bold leading-none" style={{ color: compColor }}>
                  {Math.round(team.compliancePct)}%
                </span>
                <span className="text-[9px] text-gray-400">capacidad</span>
              </div>

              {/* Hours summary */}
              <div className="text-[9px] text-gray-500 mb-2">
                <span className="font-medium text-gray-700">{team.totalHours.toFixed(0)}h</span> de {team.totalExpected.toFixed(0)}h esperadas
              </div>

              {/* Stacked capacity bar */}
              <div className="h-2 rounded-full overflow-hidden bg-gray-100 relative">
                {isOver && (
                  <div className="absolute right-0 top-0 bottom-0 z-10" style={{ right: `${Math.max(0, 100 - (100 / team.compliancePct * 100))}%` }}>
                    <div className="w-px h-full bg-gray-400" />
                  </div>
                )}
                <div className="flex h-full">
                  {clientBarW > 0 && (
                    <div className="h-full" style={{
                      width: `${isOver ? (clientBarW / team.compliancePct * 100) : clientBarW}%`,
                      backgroundColor: "#021b33",
                    }} />
                  )}
                  {internalBarW > 0 && (
                    <div className="h-full" style={{
                      width: `${isOver ? (internalBarW / team.compliancePct * 100) : internalBarW}%`,
                      backgroundColor: "#67adee",
                    }} />
                  )}
                </div>
              </div>

              {/* Client / Internal labels */}
              <div className="flex justify-between mt-1.5 text-[8px]">
                <span className="text-gray-500">
                  <span className="inline-block w-1.5 h-1.5 rounded-sm mr-0.5" style={{ backgroundColor: "#021b33" }} />
                  Cliente {Math.round(clientPct)}%
                </span>
                <span className="text-gray-500">
                  <span className="inline-block w-1.5 h-1.5 rounded-sm mr-0.5" style={{ backgroundColor: "#67adee" }} />
                  Interno {Math.round(100 - clientPct)}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Expanded team: Person capacity bars */}
      {expandedTeam && (() => {
        const team = teams.find((t) => t.key === expandedTeam);
        if (!team) return null;
        return (
          <div className="bg-white border border-gray-200 rounded-xl p-3 mb-3 shadow-sm">
            {/* Legend */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: TEAMS[team.key].color }} />
                <span className="text-[11px] font-semibold text-gray-800">{team.label}</span>
                <span className="text-[9px] text-gray-400">— {team.memberCount} miembros</span>
              </div>
              <div className="flex items-center gap-3 text-[9px] text-gray-400">
                <span><span className="inline-block w-2 h-2 rounded-sm mr-0.5" style={{ backgroundColor: "#021b33" }} /> Cliente</span>
                <span><span className="inline-block w-2 h-2 rounded-sm mr-0.5" style={{ backgroundColor: "#67adee" }} /> Interno</span>
                <span><span className="inline-block w-2 h-2 rounded-sm bg-gray-100 border border-gray-200 mr-0.5" /> Libre</span>
              </div>
            </div>

            {/* Person rows */}
            <div className="space-y-1">
              {team.members.map((person) => {
                const compColor = getComplianceColor(person.compliancePct);
                const isSelected = selection?.type === "person" && selection.data.name === person.name;
                const isOver = person.compliancePct > 100;
                const clientPctOfCap = person.expectedHours > 0 ? (person.client / person.expectedHours * 100) : 0;
                const internalPctOfCap = person.expectedHours > 0 ? (person.internal / person.expectedHours * 100) : 0;
                const freePct = Math.max(0, 100 - clientPctOfCap - internalPctOfCap);

                return (
                  <button
                    key={person.name}
                    onClick={() => handlePersonClick(person)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${
                      isSelected ? "bg-gray-50 ring-1 ring-gray-300" : "hover:bg-gray-50"
                    }`}
                  >
                    {/* Name */}
                    <div className="w-24 flex-shrink-0 text-left">
                      <span className="text-[10px] font-medium text-gray-700 truncate block">
                        {shortName(person.name)}
                      </span>
                      <span className="text-[8px] text-gray-400">
                        {person.isPartTime ? "½T · " : ""}{person.expectedHours.toFixed(0)}h cap.
                      </span>
                    </div>

                    {/* Capacity bar */}
                    <div className="flex-1 relative">
                      {/* 100% marker */}
                      {isOver && (
                        <div
                          className="absolute top-0 bottom-0 z-10"
                          style={{ left: `${100 / person.compliancePct * 100}%` }}
                        >
                          <div className="w-px h-5 bg-gray-400" />
                        </div>
                      )}

                      <div className="flex h-5 rounded overflow-hidden bg-gray-100">
                        {clientPctOfCap > 0 && (
                          <div
                            className="h-full relative flex items-center justify-center"
                            style={{
                              width: `${isOver ? (clientPctOfCap / person.compliancePct * 100) : clientPctOfCap}%`,
                              backgroundColor: "#021b33",
                            }}
                          >
                            {clientPctOfCap >= 12 && (
                              <span className="text-[8px] font-semibold text-white/90">
                                {Math.round(clientPctOfCap)}%
                              </span>
                            )}
                          </div>
                        )}
                        {internalPctOfCap > 0 && (
                          <div
                            className="h-full relative flex items-center justify-center"
                            style={{
                              width: `${isOver ? (internalPctOfCap / person.compliancePct * 100) : internalPctOfCap}%`,
                              backgroundColor: "#67adee",
                            }}
                          >
                            {internalPctOfCap >= 12 && (
                              <span className="text-[8px] font-semibold text-white/90">
                                {Math.round(internalPctOfCap)}%
                              </span>
                            )}
                          </div>
                        )}
                        {!isOver && freePct > 0 && (
                          <div className="h-full flex-1" />
                        )}
                      </div>
                    </div>

                    {/* Compliance % */}
                    <div className="w-12 flex-shrink-0 text-right">
                      <span className="text-sm font-bold" style={{ color: compColor }}>
                        {Math.round(person.compliancePct)}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Person Detail Card */}
      {selection?.type === "person" && (
        <PersonDetailCard data={selection.data} onClose={() => setSelection(null)} />
      )}
    </div>
  );
}

/* ---------- Person Detail Card ---------- */
function PersonDetailCard({ data, onClose }: { data: SelectedPerson; onClose: () => void }) {
  const compColor = getComplianceColor(data.compliancePct);
  const base = Math.max(data.expectedHours, data.total);
  const clientPctOfExpected = data.expectedHours > 0 ? (data.client / data.expectedHours * 100) : 0;
  const internalPctOfExpected = data.expectedHours > 0 ? (data.internal / data.expectedHours * 100) : 0;
  const missingHours = Math.max(0, data.expectedHours - data.total);
  const missingPctOfExpected = data.expectedHours > 0 ? (missingHours / data.expectedHours * 100) : 0;
  const clientBarW = base > 0 ? (data.client / base * 100) : 0;
  const internalBarW = base > 0 ? (data.internal / base * 100) : 0;
  const missingBarW = base > 0 ? (missingHours / base * 100) : 0;
  const clientBarColor = getClientBarColor(clientPctOfExpected, data.team);
  const internalBarColor = getInternalBarColor(internalPctOfExpected, data.team);
  const balance = getBalanceLabel(clientPctOfExpected, data.team);

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-4 shadow-sm mt-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: compColor }}
          >
            {data.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{data.name}</p>
            <p className="text-[10px] text-slate-400">
              {data.teamLabel} {data.isPartTime ? "· Medio tiempo" : ""}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg leading-none">×</button>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: compColor }}>
          Cumplimiento: {Math.round(data.compliancePct)}%
        </div>
        <div className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: balance.color }}>
          {balance.text}
        </div>
      </div>

      {/* Proportion bar */}
      <div className="mb-3">
        <div className="text-[10px] text-slate-400 mb-1">
          Distribución sobre <span className="font-semibold text-slate-600">{data.expectedHours.toFixed(0)}h esperadas</span>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
          {clientBarW > 0 && <div className="h-full" style={{ width: `${clientBarW}%`, backgroundColor: clientBarColor }} />}
          {internalBarW > 0 && <div className="h-full" style={{ width: `${internalBarW}%`, backgroundColor: internalBarColor }} />}
          {missingBarW > 0 && (
            <div className="h-full" style={{
              width: `${missingBarW}%`, backgroundColor: "#e2e8f0",
              backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)",
            }} />
          )}
        </div>
        <div className="flex justify-between mt-1 text-[10px] flex-wrap gap-x-2">
          <span style={{ color: clientBarColor }} className="font-semibold">
            Cliente: {data.client.toFixed(0)}h ({clientPctOfExpected.toFixed(0)}%)
          </span>
          <span style={{ color: internalBarColor }} className="font-semibold">
            Interno: {data.internal.toFixed(0)}h ({internalPctOfExpected.toFixed(0)}%)
          </span>
          {missingHours > 0 && (
            <span className="text-red-500 font-semibold">
              Sin registrar: {missingHours.toFixed(0)}h ({missingPctOfExpected.toFixed(0)}%)
            </span>
          )}
        </div>
      </div>

      {/* Client Projects */}
      {data.clientProjects.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1.5">Proyectos Cliente</p>
          <div className="space-y-1">
            {data.clientProjects.map((p) => {
              const pct = data.expectedHours > 0 ? (p.hours / data.expectedHours * 100) : 0;
              return (
                <div key={p.project}>
                  <div className="flex justify-between text-[10px] mb-0.5">
                    <span className="text-slate-700 truncate">{p.project}</span>
                    <span className="font-medium text-slate-600 ml-2 whitespace-nowrap">
                      {p.hours.toFixed(0)}h <span className="text-slate-400">({pct.toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, pct)}%`, backgroundColor: clientBarColor }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Internal Breakdown */}
      {data.internalProjects.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1.5">Horas Internas — ¿En qué?</p>
          <div className="space-y-1">
            {data.internalProjects.map((p) => {
              const pctOfInternal = data.internal > 0 ? (p.hours / data.internal * 100) : 0;
              const pctOfExpected = data.expectedHours > 0 ? (p.hours / data.expectedHours * 100) : 0;
              return (
                <div key={p.project}>
                  <div className="flex justify-between text-[10px] mb-0.5">
                    <span className="text-slate-700 truncate">{p.project}</span>
                    <span className="font-medium text-slate-500 ml-2 whitespace-nowrap">
                      {p.hours.toFixed(0)}h <span className="text-slate-400">({pctOfExpected.toFixed(0)}% del total)</span>
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, pctOfInternal)}%`, backgroundColor: internalBarColor }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Team Detail Card ---------- */
function TeamDetailCard({ data, onClose }: { data: SelectedTeam; onClose: () => void }) {
  const compColor = getComplianceColor(data.compliancePct);
  const clientPct = data.totalHours > 0 ? (data.clientHours / data.totalHours * 100) : 0;

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-4 shadow-sm mt-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: compColor }}>
            {data.label.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{data.label}</p>
            <p className="text-[10px] text-slate-400">{data.memberCount} miembros</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg leading-none">×</button>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: compColor }}>
          Cumplimiento: {Math.round(data.compliancePct)}%
        </div>
        <span className="text-[10px] text-slate-400">{data.totalHours.toFixed(0)}h totales</span>
      </div>

      {(() => {
        const cColor = getClientBarColor(clientPct, data.key);
        const iColor = getInternalBarColor(100 - clientPct, data.key);
        return (
          <div className="mb-3">
            <div className="flex h-2.5 rounded-full overflow-hidden bg-gray-100">
              <div className="h-full" style={{ width: `${clientPct}%`, backgroundColor: cColor }} />
              <div className="h-full" style={{ width: `${100 - clientPct}%`, backgroundColor: iColor }} />
            </div>
            <div className="flex justify-between mt-1 text-[10px]">
              <span style={{ color: cColor }} className="font-semibold">Cliente: {data.clientHours.toFixed(0)}h ({clientPct.toFixed(0)}%)</span>
              <span style={{ color: iColor }} className="font-semibold">Interno: {data.internalHours.toFixed(0)}h</span>
            </div>
          </div>
        );
      })()}

      <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1.5">Miembros</p>
      <div className="space-y-1.5">
        {data.members.map((m) => {
          const mColor = getComplianceColor(m.compliancePct);
          return (
            <div key={m.name} className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: mColor }} />
                <span className="text-slate-700">{m.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">{m.total.toFixed(0)}h</span>
                <span className="font-bold" style={{ color: mColor }}>{Math.round(m.compliancePct)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

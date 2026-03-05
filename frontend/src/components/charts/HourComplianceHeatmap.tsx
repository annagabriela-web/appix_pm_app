import { useMemo, useState } from "react";
import type { HourComplianceEntry } from "@types/finance";

interface Props {
  data: HourComplianceEntry[];
}

const HOURS_PER_DAY = 8;

// Persons exempt from compliance (part-time / different schedule)
const EXEMPT_PERSONS = new Set([
  "ana gabriela cedeño",
  "roberto.aguilar",
]);

type ComplianceCategory = "over" | "ok" | "warning" | "critical" | "exempt";

const CATEGORY_CONFIG: Record<ComplianceCategory, { label: string; color: string; textColor: string }> = {
  over:     { label: ">100%",  color: "#6278fb", textColor: "#ffffff" },
  ok:       { label: "90-100%", color: "#00e7ba", textColor: "#ffffff" },
  warning:  { label: "81-89%", color: "#f59e0b", textColor: "#ffffff" },
  critical: { label: "<80%",   color: "#ef4444", textColor: "#ffffff" },
  exempt:   { label: "Exento", color: "#e2e8f0", textColor: "#64748b" },
};

/** Count weekdays (Mon-Fri) in a given month */
function getBusinessDays(yearMonth: string): number {
  const [yearStr, monthStr] = yearMonth.split("-");
  const year = parseInt(yearStr);
  const month = parseInt(monthStr) - 1;
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  let count = 0;
  for (let d = firstDay.getDate(); d <= lastDay.getDate(); d++) {
    const day = new Date(year, month, d).getDay();
    if (day !== 0 && day !== 6) count++;
  }
  return count;
}

function getExpectedHours(yearMonth: string): number {
  return getBusinessDays(yearMonth) * HOURS_PER_DAY;
}

function getCategory(pct: number, isExempt: boolean): ComplianceCategory {
  if (isExempt) return "exempt";
  if (pct > 100) return "over";
  if (pct >= 90) return "ok";
  if (pct >= 81) return "warning";
  return "critical";
}

function getComplianceColor(pct: number, isExempt: boolean): string {
  return CATEGORY_CONFIG[getCategory(pct, isExempt)].color;
}

function getComplianceTextColor(pct: number, isExempt: boolean): string {
  return CATEGORY_CONFIG[getCategory(pct, isExempt)].textColor;
}

function getComplianceLabel(pct: number): string {
  if (pct > 100) return "Sobre-registro";
  if (pct >= 90) return "OK";
  if (pct >= 81) return "Aceptable";
  return "Crítico";
}

const MONTH_NAMES: Record<string, string> = {
  "01": "Ene", "02": "Feb", "03": "Mar", "04": "Abr",
  "05": "May", "06": "Jun", "07": "Jul", "08": "Ago",
  "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dic",
};

function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  return `${MONTH_NAMES[m] || m} ${year.slice(2)}`;
}

function shortName(name: string): string {
  const parts = name.split(" ");
  if (parts.length >= 2) return `${parts[0]} ${parts[1].charAt(0)}.`;
  return name;
}

export default function HourComplianceHeatmap({ data }: Props) {
  const [filter, setFilter] = useState<ComplianceCategory | "all">("all");

  const { persons, months, matrix, totals, expectedByMonth, totalExpected } = useMemo(() => {
    if (!data || data.length === 0)
      return {
        persons: [], months: [], matrix: new Map(),
        totals: new Map(), expectedByMonth: new Map(), totalExpected: 0,
      };

    const monthSet = new Set<string>();
    const personMap = new Map<string, Map<string, number>>();

    for (const entry of data) {
      monthSet.add(entry.month);
      if (!personMap.has(entry.name)) personMap.set(entry.name, new Map());
      personMap.get(entry.name)!.set(entry.month, parseFloat(entry.hours));
    }

    const months = Array.from(monthSet).sort();
    const expectedByMonth = new Map<string, number>();
    let totalExpected = 0;
    for (const m of months) {
      const expected = getExpectedHours(m);
      expectedByMonth.set(m, expected);
      totalExpected += expected;
    }

    const personTotals = new Map<string, number>();
    for (const [name, monthData] of personMap) {
      let total = 0;
      for (const h of monthData.values()) total += h;
      personTotals.set(name, total);
    }

    const persons = Array.from(personMap.keys()).sort(
      (a, b) => (personTotals.get(b) || 0) - (personTotals.get(a) || 0)
    );

    return { persons, months, matrix: personMap, totals: personTotals, expectedByMonth, totalExpected };
  }, [data]);

  // Filter persons by compliance category (based on total %)
  const filteredPersons = useMemo(() => {
    if (filter === "all") return persons;
    return persons.filter((p) => {
      const isExempt = EXEMPT_PERSONS.has(p.toLowerCase());
      const totalHours = totals.get(p) || 0;
      const totalPct = totalExpected > 0 ? (totalHours / totalExpected) * 100 : 0;
      return getCategory(totalPct, isExempt) === filter;
    });
  }, [persons, filter, totals, totalExpected]);

  if (persons.length === 0) {
    return (
      <div className="h-20 flex items-center justify-center text-slate-400 text-xs">
        Sin datos de cumplimiento
      </div>
    );
  }

  // Count per category for filter badges
  const categoryCounts = useMemo(() => {
    const counts: Record<ComplianceCategory, number> = { over: 0, ok: 0, warning: 0, critical: 0, exempt: 0 };
    for (const p of persons) {
      const isExempt = EXEMPT_PERSONS.has(p.toLowerCase());
      const totalHours = totals.get(p) || 0;
      const totalPct = totalExpected > 0 ? (totalHours / totalExpected) * 100 : 0;
      counts[getCategory(totalPct, isExempt)]++;
    }
    return counts;
  }, [persons, totals, totalExpected]);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-gray-900">
          Cumplimiento de Registro de Horas
        </h3>
        <p className="text-[10px] text-slate-400">
          {months.map((m) => `${formatMonth(m)} ${expectedByMonth.get(m)}h`).join(" · ")}
        </p>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-1.5 mb-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
            filter === "all" ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          Todos ({persons.length})
        </button>
        {(["over", "ok", "warning", "critical", "exempt"] as ComplianceCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(filter === cat ? "all" : cat)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
              filter === cat ? "ring-1 ring-offset-1" : "hover:opacity-80"
            }`}
            style={{
              backgroundColor: filter === cat ? CATEGORY_CONFIG[cat].color : `${CATEGORY_CONFIG[cat].color}20`,
              color: filter === cat ? CATEGORY_CONFIG[cat].textColor : CATEGORY_CONFIG[cat].color,
              ringColor: CATEGORY_CONFIG[cat].color,
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CATEGORY_CONFIG[cat].color }} />
            {CATEGORY_CONFIG[cat].label} ({categoryCounts[cat]})
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr>
              <th className="text-left py-1 px-2 text-slate-500 font-medium bg-slate-50 rounded-tl-lg sticky left-0 z-10 min-w-[110px]">
                Persona
              </th>
              {months.map((m) => (
                <th key={m} className="text-center py-1 px-1 text-slate-500 font-medium bg-slate-50 min-w-[56px]">
                  {formatMonth(m)}
                </th>
              ))}
              <th className="text-center py-1 px-2 text-slate-500 font-medium bg-slate-50 rounded-tr-lg min-w-[56px]">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredPersons.map((person, idx) => {
              const isExempt = EXEMPT_PERSONS.has(person.toLowerCase());
              const totalHours = totals.get(person) || 0;
              const totalPct = totalExpected > 0 ? (totalHours / totalExpected) * 100 : 0;

              return (
                <tr key={person} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                  <td className="py-0.5 px-2 font-medium text-gray-800 sticky left-0 z-10 bg-inherit whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <span className="text-[11px]">{shortName(person)}</span>
                      {isExempt && (
                        <span className="text-[8px] px-0.5 rounded bg-slate-100 text-slate-400">PT</span>
                      )}
                    </div>
                  </td>
                  {months.map((m) => {
                    const hours = matrix.get(person)?.get(m) || 0;
                    const expected = expectedByMonth.get(m) || 160;
                    const pct = expected > 0 ? (hours / expected) * 100 : 0;

                    return (
                      <td key={m} className="py-0.5 px-0.5 text-center">
                        <div
                          className="relative group rounded px-0.5 py-1 cursor-default"
                          style={{ backgroundColor: getComplianceColor(pct, isExempt), color: getComplianceTextColor(pct, isExempt) }}
                        >
                          <div className="font-bold text-[11px] leading-none">{Math.round(hours)}</div>
                          <div className="text-[8px] opacity-80">{Math.round(pct)}%</div>
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-20">
                            <div className="bg-gray-900 text-white rounded-lg shadow-lg p-1.5 text-[9px] whitespace-nowrap">
                              <p className="font-semibold">{person}</p>
                              <p>{hours.toFixed(1)}h / {expected}h</p>
                              <p>{Math.round(pct)}% — {isExempt ? "Exento" : getComplianceLabel(pct)}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                  <td className="py-0.5 px-1 text-center">
                    <div
                      className="rounded px-0.5 py-1"
                      style={{ backgroundColor: getComplianceColor(totalPct, isExempt), color: getComplianceTextColor(totalPct, isExempt) }}
                    >
                      <div className="font-bold text-[11px] leading-none">{Math.round(totalHours)}</div>
                      <div className="text-[8px] opacity-80">{Math.round(totalPct)}%</div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

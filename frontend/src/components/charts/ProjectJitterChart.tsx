import { useMemo } from "react";
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useSprints } from "@hooks/useSprints";
import { formatHoursMinutes } from "@services/formatters";

const SPRINT_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#94a3b8"];

interface JitterPoint {
  x: number;
  y: number;
  taskName: string;
  userName: string;
  sprintName: string;
  rawHours: number;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d: JitterPoint = payload[0].payload;
  const dateStr = new Date(d.x).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-xs">
      <p className="font-mono font-semibold text-primary">{d.taskName}</p>
      <p className="text-slate-500 mt-1">
        {formatHoursMinutes(d.rawHours)} &middot; {d.userName}
      </p>
      <p className="text-slate-400 mt-0.5">{dateStr}</p>
      <p className="text-slate-400 mt-0.5">{d.sprintName}</p>
    </div>
  );
}

export default function ProjectJitterChart({ projectId }: { projectId: number }) {
  const { data: sprints = [], isLoading } = useSprints(projectId);

  const sprintData = useMemo(() => {
    return sprints.map((sprint, si) => ({
      sprint,
      color: SPRINT_COLORS[si % SPRINT_COLORS.length],
      points: sprint.timeEntries
        .filter((te) => parseFloat(te.durationHours) > 0)
        .map((te, ti) => {
          const dateMs = new Date(te.date).getTime();
          // Deterministic jitter to prevent overlap
          const jitterX = (((si * 17 + ti * 31) % 10) - 5) * 12 * 60 * 60 * 1000;
          const jitterY = (((si * 13 + ti * 7) % 6) - 3) * 0.02;
          const hours = parseFloat(te.durationHours);
          // Extract task name from description "Trabajo en CAP-8" -> "CAP-8"
          const taskName = te.description.replace(/^Trabajo en /, "");
          return {
            x: dateMs + jitterX,
            y: Math.max(0.1, hours + jitterY),
            taskName,
            userName: te.userName,
            sprintName: sprint.name,
            rawHours: hours,
          } as JitterPoint;
        }),
    }));
  }, [sprints]);

  const allPoints = sprintData.flatMap((s) => s.points);
  const totalHours = allPoints.reduce((acc, p) => acc + p.rawHours, 0);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="h-5 w-56 bg-gray-200 rounded mb-4" />
        <div className="h-64 bg-gray-100 rounded" />
      </div>
    );
  }

  if (allPoints.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900">Distribucion de Horas por Sprint</h3>
        <p className="text-xs text-slate-500 mt-1">No hay registros de tiempo asignados a sprints.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-900">
        Distribucion de Horas por Sprint
      </h3>
      <p className="text-xs text-slate-500 mt-0.5 mb-4">
        Cada punto es un registro de tiempo real (Clockify) asignado al sprint correspondiente
      </p>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={320}>
        <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis
            type="number"
            dataKey="x"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(ms: number) =>
              new Date(ms).toLocaleDateString("es-MX", { month: "short", day: "numeric" })
            }
            tick={{ fontSize: 10, fill: "#64748B" }}
            name="Fecha"
          />
          <YAxis
            type="number"
            dataKey="y"
            tick={{ fontSize: 11, fill: "#64748B" }}
            name="Horas"
            tickFormatter={(h: number) => formatHoursMinutes(h)}
            label={{ value: "Tiempo", angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "#64748B" } }}
          />
          <Tooltip content={<CustomTooltip />} />
          {sprintData.map(({ sprint, color, points }) => (
            <Scatter
              key={sprint.id}
              name={sprint.name}
              data={points}
              fill={color}
              opacity={0.75}
              r={4}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>

      {/* Sprint legend */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
        {sprintData.map(({ sprint, color }) => (
          <div key={sprint.id} className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="truncate max-w-[120px]">{sprint.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

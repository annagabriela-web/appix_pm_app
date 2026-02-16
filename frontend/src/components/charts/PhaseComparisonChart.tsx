import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { usePhaseComparison } from "@hooks/usePhaseComparison";
import { formatHours } from "@services/formatters";

import QueryProvider from "@components/providers/QueryProvider";

import AccessibleDataTable from "./AccessibleDataTable";
import TableViewToggle from "./TableViewToggle";

interface PhaseComparisonChartProps {
  projectId: number;
}

function PhaseChartInner({ projectId }: PhaseComparisonChartProps) {
  const [isTableView, setIsTableView] = useState(false);
  const { data, isLoading } = usePhaseComparison(projectId);

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center text-neutral">
        Cargando comparacion por fase...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-neutral">
        Sin datos de fases disponibles
      </div>
    );
  }

  const chartData = data.map((phase) => {
    const estimated = parseFloat(phase.estimatedHours);
    const actual = parseFloat(phase.actualHours);

    let fillColor = "#10B981"; // healthy
    if (actual > estimated * 1.15) {
      fillColor = "#EF4444"; // critical
    } else if (actual > estimated) {
      fillColor = "#F59E0B"; // warning
    }

    return {
      name: phase.phaseName,
      estimated,
      actual,
      fillColor,
    };
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">
          Estimado vs Real por Fase
        </h3>
        <TableViewToggle
          isTableView={isTableView}
          onToggle={() => setIsTableView(!isTableView)}
        />
      </div>

      {isTableView ? (
        <AccessibleDataTable
          caption="Comparacion de horas por fase"
          columns={[
            { key: "phase", label: "Fase" },
            { key: "estimated", label: "Estimado" },
            { key: "actual", label: "Real" },
            { key: "diff", label: "Diferencia" },
          ]}
          data={data.map((p) => {
            const diff =
              parseFloat(p.actualHours) - parseFloat(p.estimatedHours);
            return {
              phase: p.phaseName,
              estimated: formatHours(p.estimatedHours),
              actual: formatHours(p.actualHours),
              diff: `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}h`,
            };
          })}
        />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#64748B" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#64748B" }}
              tickFormatter={(v: number) => `${v}h`}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                formatHours(value.toString()),
                name === "estimated" ? "Estimado" : "Real",
              ]}
            />
            <Legend
              formatter={(value: string) =>
                value === "estimated" ? "Estimado" : "Real"
              }
            />
            <Bar dataKey="estimated" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="actual" fill="#64748B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default function PhaseComparisonChart(
  props: PhaseComparisonChartProps
) {
  return (
    <QueryProvider>
      <PhaseChartInner {...props} />
    </QueryProvider>
  );
}

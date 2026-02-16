import { useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useBurndown } from "@hooks/useBurndown";
import { formatCurrency } from "@services/formatters";

import QueryProvider from "@components/providers/QueryProvider";

import AccessibleDataTable from "./AccessibleDataTable";
import TableViewToggle from "./TableViewToggle";

interface FinancialBurndownChartProps {
  projectId: number;
}

function BurndownChartInner({ projectId }: FinancialBurndownChartProps) {
  const [isTableView, setIsTableView] = useState(false);
  const { data, isLoading } = useBurndown(projectId);

  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center text-neutral">
        Cargando datos del burndown...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-neutral">
        Sin datos de burndown disponibles
      </div>
    );
  }

  const chartData = data.map((point) => ({
    date: point.date,
    budget: parseFloat(point.budgetLine),
    actual: parseFloat(point.actualCostCumulative),
    earned: parseFloat(point.earnedValueCumulative),
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">
          Financial Burndown
        </h3>
        <TableViewToggle
          isTableView={isTableView}
          onToggle={() => setIsTableView(!isTableView)}
        />
      </div>

      {isTableView ? (
        <AccessibleDataTable
          caption="Datos de Financial Burndown"
          columns={[
            { key: "date", label: "Fecha" },
            { key: "budget", label: "Presupuesto" },
            { key: "actual", label: "Costo Real" },
            { key: "earned", label: "Valor Ganado" },
          ]}
          data={data.map((p) => ({
            date: p.date,
            budget: formatCurrency(p.budgetLine),
            actual: formatCurrency(p.actualCostCumulative),
            earned: formatCurrency(p.earnedValueCumulative),
          }))}
        />
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#64748B" }}
              tickFormatter={(v: string) => v.slice(5)}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#64748B" }}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                formatCurrency(value.toString()),
                name === "budget"
                  ? "Presupuesto"
                  : name === "actual"
                    ? "Costo Real"
                    : "Valor Ganado",
              ]}
              labelFormatter={(label: string) => `Fecha: ${label}`}
            />
            <Legend
              formatter={(value: string) =>
                value === "budget"
                  ? "Presupuesto"
                  : value === "actual"
                    ? "Costo Real"
                    : "Valor Ganado"
              }
            />
            <Line
              type="monotone"
              dataKey="budget"
              stroke="#64748B"
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#EF4444"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="earned"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default function FinancialBurndownChart(
  props: FinancialBurndownChartProps
) {
  return (
    <QueryProvider>
      <BurndownChartInner {...props} />
    </QueryProvider>
  );
}

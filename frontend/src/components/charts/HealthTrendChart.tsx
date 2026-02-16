import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useHealthHistory } from "@hooks/useHealthHistory";

import QueryProvider from "@components/providers/QueryProvider";

interface HealthTrendChartProps {
  projectId: number;
}

function TrendChartInner({ projectId }: HealthTrendChartProps) {
  const { data, isLoading } = useHealthHistory(projectId);

  if (isLoading) {
    return (
      <div className="h-48 flex items-center justify-center text-neutral">
        Cargando tendencia...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-neutral">
        Sin historial de salud
      </div>
    );
  }

  const chartData = [...data].reverse().map((snapshot) => ({
    date: snapshot.timestamp.slice(0, 10),
    score: snapshot.healthScore,
    status: snapshot.healthStatus,
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        Tendencia de Salud
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#64748B" }}
            tickFormatter={(v: string) => v.slice(5)}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: "#64748B" }}
          />
          <Tooltip
            formatter={(value: number) => [`${value}`, "Health Score"]}
            labelFormatter={(label: string) => `Fecha: ${label}`}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#10B981"
            strokeWidth={2}
            fill="url(#healthGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function HealthTrendChart(props: HealthTrendChartProps) {
  return (
    <QueryProvider>
      <TrendChartInner {...props} />
    </QueryProvider>
  );
}

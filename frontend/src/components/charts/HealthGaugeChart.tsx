import { RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";

import type { HealthStatus } from "@types/finance";

import { getHealthColor } from "@services/formatters";

interface HealthGaugeChartProps {
  score: number;
  status: HealthStatus;
}

export default function HealthGaugeChart({
  score,
  status,
}: HealthGaugeChartProps) {
  const color = getHealthColor(status);

  const data = [
    {
      name: "health",
      value: score,
      fill: color,
    },
  ];

  return (
    <div className="relative w-40 h-40">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="70%"
          outerRadius="100%"
          startAngle={180}
          endAngle={0}
          data={data}
          barSize={12}
        >
          <RadialBar
            dataKey="value"
            cornerRadius={6}
            background={{ fill: "#F1F5F9" }}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-3xl font-bold financial-number"
          style={{ color }}
        >
          {score}
        </span>
        <span className="text-[10px] font-medium text-neutral uppercase tracking-wider">
          Health Score
        </span>
      </div>
    </div>
  );
}

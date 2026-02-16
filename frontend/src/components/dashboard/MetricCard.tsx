import { TrendingDown, TrendingUp, Minus } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  subtitle?: string;
  trend?: "up" | "down" | "flat";
}

const trendIcons = {
  up: <TrendingUp size={14} className="text-critical" />,
  down: <TrendingDown size={14} className="text-healthy" />,
  flat: <Minus size={14} className="text-neutral" />,
};

export default function MetricCard({
  label,
  value,
  subtitle,
  trend,
}: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs font-medium text-neutral uppercase tracking-wide">
        {label}
      </p>
      <div className="flex items-center gap-2 mt-1">
        <p className="text-2xl font-bold text-gray-900 financial-number">
          {value}
        </p>
        {trend && trendIcons[trend]}
      </div>
      {subtitle && (
        <p className="text-xs text-neutral mt-1 financial-number">{subtitle}</p>
      )}
    </div>
  );
}

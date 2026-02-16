import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react";

import type { HealthStatus } from "@types/finance";

import { getHealthBgClass, getHealthLabel } from "@services/formatters";

interface StatusBadgeProps {
  status: HealthStatus;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs gap-1",
  md: "px-2.5 py-1 text-xs gap-1.5",
  lg: "px-3 py-1.5 text-sm gap-2",
};

const iconSizes = { sm: 12, md: 14, lg: 16 };

const StatusIcon = ({
  status,
  size,
}: {
  status: HealthStatus;
  size: number;
}) => {
  switch (status) {
    case "CRITICAL":
      return <AlertTriangle size={size} />;
    case "WARNING":
      return <AlertCircle size={size} />;
    case "HEALTHY":
      return <CheckCircle size={size} />;
  }
};

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  return (
    <span
      role="status"
      aria-label={`Estado: ${getHealthLabel(status)}`}
      className={`inline-flex items-center rounded-full font-semibold ${getHealthBgClass(status)} ${sizeClasses[size]}`}
    >
      <StatusIcon status={status} size={iconSizes[size]} />
      {getHealthLabel(status)}
    </span>
  );
}

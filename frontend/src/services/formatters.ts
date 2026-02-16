import type { HealthStatus } from "@types/finance";

export function formatCurrency(value: string, locale = "en-US"): string {
  const num = parseFloat(value);
  if (isNaN(num)) return "$0.00";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatPercent(value: string): string {
  const num = parseFloat(value);
  if (isNaN(num)) return "0.00%";
  return `${num.toFixed(2)}%`;
}

export function formatHours(value: string): string {
  const num = parseFloat(value);
  if (isNaN(num)) return "0h";
  return `${num.toFixed(1)}h`;
}

export function getHealthColor(status: HealthStatus): string {
  const colors: Record<HealthStatus, string> = {
    CRITICAL: "#EF4444",
    WARNING: "#F59E0B",
    HEALTHY: "#10B981",
  };
  return colors[status];
}

export function getHealthBgClass(status: HealthStatus): string {
  const classes: Record<HealthStatus, string> = {
    CRITICAL: "bg-critical/10 text-critical",
    WARNING: "bg-warning/10 text-warning",
    HEALTHY: "bg-healthy/10 text-healthy",
  };
  return classes[status];
}

export function getHealthLabel(status: HealthStatus): string {
  const labels: Record<HealthStatus, string> = {
    CRITICAL: "Critico",
    WARNING: "Advertencia",
    HEALTHY: "Saludable",
  };
  return labels[status];
}

import { AlertTriangle, X } from "lucide-react";

import type { ProjectHealthAlert } from "@types/finance";

interface AlertBannerProps {
  alert: ProjectHealthAlert;
  onDismiss: (id: number) => void;
}

export default function AlertBanner({ alert, onDismiss }: AlertBannerProps) {
  const bgClass =
    alert.alertType === "CRITICAL"
      ? "bg-critical/10 border-critical/30"
      : "bg-warning/10 border-warning/30";

  const textClass =
    alert.alertType === "CRITICAL" ? "text-critical" : "text-warning";

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border ${bgClass} transition-all duration-300`}
      role="alert"
    >
      <AlertTriangle size={18} className={textClass} />
      <div className="flex-1">
        <p className={`text-sm font-semibold ${textClass}`}>
          {alert.alertType === "CRITICAL"
            ? "Desviacion Critica"
            : "Advertencia de Desviacion"}
        </p>
        <p className="text-sm text-gray-700 mt-0.5">{alert.message}</p>
      </div>
      <button
        onClick={() => onDismiss(alert.id)}
        className="text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Cerrar alerta"
      >
        <X size={16} />
      </button>
    </div>
  );
}

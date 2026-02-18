import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react";
import type { ProjectDetail } from "@types/finance";
import type { HealthStatus } from "@types/finance";

const statusConfig: Record<HealthStatus, { label: string; bg: string; text: string; Icon: typeof CheckCircle }> = {
  HEALTHY: { label: "En Camino", bg: "bg-emerald-500/20", text: "text-emerald-100", Icon: CheckCircle },
  WARNING: { label: "En Riesgo", bg: "bg-amber-500/20", text: "text-amber-200", Icon: AlertTriangle },
  CRITICAL: { label: "Critico", bg: "bg-red-500/20", text: "text-red-200", Icon: AlertCircle },
};

export default function ProjectDetailHeader({ project }: { project: ProjectDetail }) {
  const config = statusConfig[project.currentHealthStatus];
  const StatusIcon = config.Icon;

  return (
    <div
      className="flex items-center justify-between py-4 px-6 rounded-xl"
      style={{ backgroundColor: "#021b33" }}
    >
      <div className="flex items-center gap-4">
        <span className="text-xl font-semibold text-white">
          {project.clientName}
        </span>
        {project.jiraProjectKey && (
          <span className="font-mono text-xs bg-slate-700 text-slate-300 px-2.5 py-1 rounded">
            {project.jiraProjectKey}
          </span>
        )}
        <span className="text-sm text-slate-400">{project.name}</span>
      </div>
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${config.bg}`}>
        <StatusIcon size={14} className={config.text} />
        <span className={`text-xs font-semibold ${config.text}`}>
          {config.label}
        </span>
      </div>
    </div>
  );
}

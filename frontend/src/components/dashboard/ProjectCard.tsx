import type { Project } from "@types/finance";
import { formatCurrency, formatPercent, getHealthLabel } from "@services/formatters";
import { ArrowRight } from "lucide-react";

const statusConfig = {
  HEALTHY: {
    pill: "bg-emerald-100 text-emerald-700",
    bar: "bg-emerald-500",
  },
  WARNING: {
    pill: "bg-orange-100 text-orange-700",
    bar: "bg-blue-500",
  },
  CRITICAL: {
    pill: "bg-red-100 text-red-700",
    bar: "bg-red-500",
  },
} as const;

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-amber-500",
  "bg-pink-500",
  "bg-teal-500",
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const config = statusConfig[project.currentHealthStatus];
  const progressNum = parseFloat(project.progressPercent);
  const label = getHealthLabel(project.currentHealthStatus);

  const avatarSeeds = [project.name, project.clientName];

  return (
    <a
      href={`/projects/${project.id}`}
      className="block bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow group"
    >
      {/* Header: name + status badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-bold text-gray-900 text-sm leading-tight truncate">
            {project.name}
          </h3>
          <p className="text-xs text-neutral mt-0.5 truncate">
            {project.clientName}
          </p>
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${config.pill}`}
        >
          {label}
        </span>
      </div>

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-neutral font-medium">Progreso</span>
          <span className="text-xs font-semibold text-gray-900 financial-number">
            {formatPercent(project.progressPercent)}
          </span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${config.bar} transition-all`}
            style={{ width: `${Math.min(progressNum, 100)}%` }}
            role="progressbar"
            aria-valuenow={progressNum}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progreso: ${formatPercent(project.progressPercent)}`}
          />
        </div>
      </div>

      {/* Budget & Spent */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] text-neutral uppercase tracking-wide font-medium">
            Presupuesto
          </p>
          <p className="text-sm font-semibold text-gray-900 financial-number mt-0.5">
            {formatCurrency(project.clientInvoiceAmount)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-neutral uppercase tracking-wide font-medium">
            Gastado
          </p>
          <p className="text-sm font-semibold text-gray-900 financial-number mt-0.5">
            {formatCurrency(project.actualCost)}
          </p>
        </div>
      </div>

      {/* Footer: avatars + navigate arrow */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex -space-x-2">
          {avatarSeeds.map((seed, i) => (
            <div
              key={i}
              className={`w-7 h-7 rounded-full ${AVATAR_COLORS[i % AVATAR_COLORS.length]} border-2 border-white flex items-center justify-center text-white text-[10px] font-bold`}
              title={seed}
            >
              {getInitials(seed)}
            </div>
          ))}
        </div>
        <span className="p-1.5 rounded-lg text-neutral group-hover:bg-gray-100 group-hover:text-gray-900 transition-colors">
          <ArrowRight size={16} />
        </span>
      </div>
    </a>
  );
}

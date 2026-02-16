import { useProjectDetail } from "@hooks/useProjects";
import {
  formatCurrency,
  formatHours,
  formatPercent,
} from "@services/formatters";

import FinancialBurndownChart from "@components/charts/FinancialBurndownChart";
import HealthGaugeChart from "@components/charts/HealthGaugeChart";
import HealthTrendChart from "@components/charts/HealthTrendChart";
import QueryProvider from "@components/providers/QueryProvider";

import MetricCard from "./MetricCard";
import StatusBadge from "./StatusBadge";
import TripleAxisCard from "./TripleAxisCard";
import ExportButtons from "./ExportButtons";

interface ProjectDashboardProps {
  projectId: number;
}

function DashboardInner({ projectId }: ProjectDashboardProps) {
  const { data: project, isLoading } = useProjectDetail(projectId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center text-neutral py-12">
        Proyecto no encontrado
      </div>
    );
  }

  const score = project.latestSnapshot?.healthScore ?? 50;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">
              {project.name}
            </h2>
            <StatusBadge status={project.currentHealthStatus} />
          </div>
          <p className="text-sm text-neutral mt-1">
            {project.code} &middot; {project.clientName}
          </p>
        </div>
        <ExportButtons projectId={projectId} />
      </div>

      {/* Row 1: Gauge + Key Metrics */}
      <div className="grid grid-cols-5 gap-4">
        <div className="flex items-center justify-center">
          <HealthGaugeChart
            score={score}
            status={project.currentHealthStatus}
          />
        </div>
        <MetricCard
          label="Presupuesto"
          value={formatCurrency(project.clientInvoiceAmount)}
          subtitle={`${formatHours(project.budgetHours)} horas`}
        />
        <MetricCard
          label="Costo Real"
          value={formatCurrency(project.actualCost)}
          subtitle={`${formatHours(project.consumedHours)} consumidas`}
          trend={
            parseFloat(project.consumptionPercent) >
            parseFloat(project.progressPercent)
              ? "up"
              : "flat"
          }
        />
        <MetricCard
          label="Margen Objetivo"
          value={formatPercent(project.targetMargin)}
        />
        <MetricCard
          label="Valor Ganado"
          value={formatCurrency(project.earnedValue)}
          subtitle={formatPercent(project.progressPercent) + " progreso"}
        />
      </div>

      {/* Row 2: Financial Burndown */}
      <FinancialBurndownChart projectId={projectId} />

      {/* Row 3: Triple Axis Card */}
      <TripleAxisCard projectId={projectId} />

      {/* Row 4: Health Trend */}
      <HealthTrendChart projectId={projectId} />
    </div>
  );
}

export default function ProjectDashboard(props: ProjectDashboardProps) {
  return (
    <QueryProvider>
      <DashboardInner {...props} />
    </QueryProvider>
  );
}

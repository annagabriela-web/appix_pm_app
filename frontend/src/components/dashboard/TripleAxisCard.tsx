import { useProjectDetail } from "@hooks/useProjects";
import { formatCurrency, formatHours, formatPercent } from "@services/formatters";

import QueryProvider from "@components/providers/QueryProvider";
import PhaseComparisonChart from "@components/charts/PhaseComparisonChart";

import AlertBanner from "./AlertBanner";
import MetricCard from "./MetricCard";

interface TripleAxisCardProps {
  projectId: number;
}

function TripleAxisInner({ projectId }: TripleAxisCardProps) {
  const { data: project, isLoading } = useProjectDetail(projectId);

  if (isLoading || !project) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-20 bg-gray-200 rounded" />
            <div className="h-20 bg-gray-200 rounded" />
            <div className="h-20 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const consumptionPct = parseFloat(project.consumptionPercent);
  const progressPct = parseFloat(project.progressPercent);
  const costTrend = consumptionPct > progressPct ? "up" : "flat";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      <h3 className="text-sm font-semibold text-gray-900">
        Triple Axis Varianza
      </h3>

      {/* Top: Key Metrics Row */}
      <div className="grid grid-cols-3 gap-4">
        <MetricCard
          label="Presupuesto"
          value={formatCurrency(project.clientInvoiceAmount)}
          subtitle={`${formatHours(project.budgetHours)} presupuestadas`}
        />
        <MetricCard
          label="Consumido"
          value={formatHours(project.consumedHours)}
          subtitle={formatPercent(project.consumptionPercent)}
          trend={costTrend}
        />
        <MetricCard
          label="Progreso"
          value={formatPercent(project.progressPercent)}
          subtitle={`EV: ${formatCurrency(project.earnedValue)}`}
        />
      </div>

      {/* Middle: Phase Comparison Chart */}
      <PhaseComparisonChart projectId={projectId} />

      {/* Bottom: Alert Banner (if active) */}
      {project.currentHealthStatus !== "HEALTHY" &&
        project.latestSnapshot && (
          <AlertBanner
            alert={{
              id: 0,
              project: project.id,
              projectName: project.name,
              projectCode: project.code,
              alertType: project.currentHealthStatus === "CRITICAL" ? "CRITICAL" : "WARNING",
              message: `Consumo: ${project.consumptionPercent}% | Progreso: ${project.progressPercent}% | Desviacion significativa detectada.`,
              isRead: false,
              createdAt: new Date().toISOString(),
            }}
            onDismiss={() => {}}
          />
        )}
    </div>
  );
}

export default function TripleAxisCard(props: TripleAxisCardProps) {
  return (
    <QueryProvider>
      <TripleAxisInner {...props} />
    </QueryProvider>
  );
}

import { CheckCircle2, Circle } from "lucide-react";
import { useProjectDetail } from "@hooks/useProjects";
import type { Phase } from "@types/finance";

function formatMoney(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

function PhaseRow({
  phase,
  index,
  hourlyRate,
}: {
  phase: Phase;
  index: number;
  hourlyRate: number;
}) {
  const actual = parseFloat(phase.actualHours);
  const estimated = parseFloat(phase.estimatedHours);
  const overconsumed = actual > estimated && estimated > 0;
  const hoursPct = estimated > 0 ? (actual / estimated) * 100 : 0;

  const invoiceAmount = parseFloat(phase.invoiceAmount ?? "0");
  const actualCost = actual * hourlyRate;
  const costOver = actualCost > invoiceAmount && invoiceAmount > 0;

  // Bar color: green = paid, amber = pending with work, gray = no work yet
  const barColor = phase.isPaid ? "#10B981" : actual > 0 ? "#F59E0B" : "#94A3B8";

  return (
    <div className="py-2.5 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-2">
        {/* Billing icon */}
        {phase.isPaid ? (
          <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
        ) : (
          <Circle size={15} className="text-slate-300 shrink-0" />
        )}

        {/* Name */}
        <span className="text-xs font-semibold text-gray-800 truncate flex-1">
          {index + 1}. {phase.name}
        </span>

        {/* Hours */}
        <span className={`text-xs font-bold shrink-0 ${overconsumed ? "text-red-600" : "text-gray-700"}`}>
          {actual.toFixed(0)}/{estimated.toFixed(0)}h
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-1.5 ml-[23px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.min(hoursPct, 100)}%`,
            backgroundColor: barColor,
          }}
        />
      </div>

      {/* Financial row */}
      <div className="flex items-center justify-between mt-1 ml-[23px]">
        <span className={`text-[10px] font-medium ${phase.isPaid ? "text-emerald-600" : "text-slate-400"}`}>
          {phase.isPaid ? "Pagada" : "Pendiente"}
        </span>
        <span className={`text-[10px] font-medium ${costOver ? "text-red-500" : "text-slate-400"}`}>
          {formatMoney(actualCost)} / {formatMoney(invoiceAmount)}
        </span>
      </div>
    </div>
  );
}

export default function ProjectPhasesCard({ projectId }: { projectId: number }) {
  const { data: project, isLoading } = useProjectDetail(projectId);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
        <div className="h-5 w-48 bg-gray-200 rounded mb-3" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  const phases = project?.phases ?? [];
  const totalEstimated = phases.reduce((a, p) => a + parseFloat(p.estimatedHours), 0);
  const totalActual = phases.reduce((a, p) => a + parseFloat(p.actualHours), 0);
  const totalOverconsumed = totalActual > totalEstimated;

  const totalActualCost = parseFloat(project?.actualCost ?? "0");
  const totalConsumed = parseFloat(project?.consumedHours ?? "0");
  const hourlyRate = totalConsumed > 0 ? totalActualCost / totalConsumed : 0;

  const totalInvoice = parseFloat(project?.clientInvoiceAmount ?? "0");
  const totalCostOver = totalActualCost > totalInvoice;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Etapas del Proyecto</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Progreso y facturación por etapa
          </p>
        </div>
        <div className="text-right">
          <span className={`text-sm font-bold ${totalOverconsumed ? "text-red-600" : "text-gray-700"}`}>
            {totalActual.toFixed(0)}/{totalEstimated.toFixed(0)}h
          </span>
          <p className={`text-[10px] ${totalCostOver ? "text-red-500" : "text-slate-400"}`}>
            {formatMoney(totalActualCost)} / {formatMoney(totalInvoice)}
          </p>
        </div>
      </div>

      {/* Phase list */}
      <div>
        {phases.map((phase, i) => (
          <PhaseRow key={phase.id} phase={phase} index={i} hourlyRate={hourlyRate} />
        ))}
      </div>
    </div>
  );
}

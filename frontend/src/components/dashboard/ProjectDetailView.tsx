import QueryProvider from "@components/providers/QueryProvider";
import { useProjectDetail } from "@hooks/useProjects";
import ProjectDetailHeader from "./ProjectDetailHeader";
import ProjectPhasesCard from "./ProjectPhasesCard";
import ProjectJitterChart from "@components/charts/ProjectJitterChart";
import SprintsSection from "./SprintsSection";

function DetailInner({ projectId }: { projectId: number }) {
  const { data: project, isLoading, isError } = useProjectDetail(projectId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-gray-200 rounded-xl animate-pulse" />
        <div className="h-20 bg-gray-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-96 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No se pudo cargar el proyecto.</p>
        <a href="/projects" className="text-primary text-sm hover:underline mt-2 inline-block">
          Volver al Inicio
        </a>
      </div>
    );
  }

  const phases = project?.phases ?? [];
  const totalInvoice = parseFloat(project?.clientInvoiceAmount ?? "0");
  const anticipoAmount = parseFloat(project?.anticipoAmount ?? "0");

  // Pagos manuales per-sprint = fases isPaid con su propio PDF (no cubiertas por anticipo)
  const manualPaid = phases
    .filter((p) => p.isPaid && p.invoiceFileUrl && p.invoiceAmount)
    .reduce((acc, p) => acc + parseFloat(p.invoiceAmount!), 0);

  // Cobrado = anticipo + pagos manuales per-sprint
  const totalPaid = anticipoAmount > 0
    ? anticipoAmount + manualPaid
    : phases
        .filter((p) => p.isPaid && p.invoiceAmount)
        .reduce((acc, p) => acc + parseFloat(p.invoiceAmount!), 0);

  // Facturas per-sprint emitidas (con fecha)
  const perSprintInvoiced = phases
    .filter((p) => p.invoiceAmount && p.invoiceDate)
    .reduce((acc, p) => acc + parseFloat(p.invoiceAmount!), 0);

  // Facturado = anticipo + facturas per-sprint emitidas
  const totalInvoiced = anticipoAmount + perSprintInvoiced;

  const totalActualCost = parseFloat(project?.actualCost ?? "0");
  const totalBudgetHours = parseFloat(project?.budgetHours ?? "0");
  const totalConsumedHours = parseFloat(project?.consumedHours ?? "0");
  const paidPct = totalInvoice > 0 ? (totalPaid / totalInvoice) * 100 : 0;
  const invoicedPct = totalInvoice > 0 ? (totalInvoiced / totalInvoice) * 100 : 0;

  return (
    <div className="space-y-6">
      <ProjectDetailHeader project={project} />

      {/* Financial KPI Strip */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
          {/* KPI 1: Cotización */}
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Cotización</p>
            <p className="text-xl font-bold text-gray-900">
              ${totalInvoice.toLocaleString("en-US")}
            </p>
          </div>
          {/* KPI 2: Cobrado */}
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Cobrado</p>
            <p className={`text-xl font-bold ${paidPct < 50 ? "text-amber-600" : "text-emerald-600"}`}>
              ${totalPaid.toLocaleString("en-US")}
              <span className="text-xs font-medium text-slate-400 ml-1">
                ({paidPct.toFixed(0)}%)
              </span>
            </p>
            {anticipoAmount > 0 && (
              <p className="text-[10px] text-blue-600 font-medium mt-0.5">
                Anticipo: ${anticipoAmount.toLocaleString("en-US")}
              </p>
            )}
          </div>
          {/* KPI 3: Costo Real */}
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Costo Real</p>
            <p className={`text-xl font-bold ${totalActualCost > totalInvoice ? "text-red-600" : "text-gray-900"}`}>
              ${totalActualCost.toLocaleString("en-US")}
            </p>
          </div>
          {/* KPI 4: Horas */}
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Horas Consumidas</p>
            <p className={`text-xl font-bold ${totalConsumedHours > totalBudgetHours ? "text-red-600" : "text-gray-900"}`}>
              {totalConsumedHours.toFixed(0)}h
              <span className="text-xs font-medium text-slate-400 ml-1">
                / {totalBudgetHours.toFixed(0)}h
              </span>
            </p>
          </div>
        </div>

      </div>

      {/* Section 2: Phases + Jitter Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProjectPhasesCard projectId={projectId} />
        <ProjectJitterChart projectId={projectId} />
      </div>

      {/* Section 3: Sprint Management */}
      <SprintsSection projectId={projectId} phases={phases} />
    </div>
  );
}

export default function ProjectDetailView({ projectId }: { projectId: number }) {
  return (
    <QueryProvider>
      <DetailInner projectId={projectId} />
    </QueryProvider>
  );
}

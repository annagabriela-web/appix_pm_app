import { useState, useRef, useEffect } from "react";
import { CheckCircle2, Circle, FileText, Plus, Pencil } from "lucide-react";
import { useProjectDetail } from "@hooks/useProjects";
import type { Phase } from "@types/finance";
import PhaseInvoiceDialog from "./dialogs/PhaseInvoiceDialog";
import AnticipoDialog from "./dialogs/AnticipoDialog";

function formatMoneyFull(n: number): string {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/** Compute coverage: which phases are covered by paid invoices */
function computeCoverage(phases: Phase[], totalInvoice: number) {
  const totalPaid = phases
    .filter((p) => p.isPaid && p.invoiceAmount)
    .reduce((acc, p) => acc + parseFloat(p.invoiceAmount!), 0);

  const paidPct = totalInvoice > 0 ? (totalPaid / totalInvoice) * 100 : 0;

  // Walk phases in order to find coverage boundary
  let cumulative = 0;
  let lastCoveredIndex = -1;
  for (let i = 0; i < phases.length; i++) {
    cumulative += parseFloat(phases[i].invoiceAmount ?? "0");
    if (cumulative <= totalPaid && phases[i].isPaid) {
      lastCoveredIndex = i;
    } else {
      break;
    }
  }

  const nextPhase = lastCoveredIndex + 1 < phases.length ? phases[lastCoveredIndex + 1] : null;
  const nextAmount = nextPhase ? parseFloat(nextPhase.invoiceAmount ?? "0") : 0;

  return { totalPaid, paidPct, lastCoveredIndex, nextPhase, nextAmount };
}

function formatMoney(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

function PhaseCrDropdown({
  phase,
  hourlyRate,
  onClose,
  onOpenInvoice,
}: {
  phase: Phase;
  hourlyRate: number;
  onClose: () => void;
  onOpenInvoice: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { crImpact } = phase;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    // Use setTimeout to avoid capturing the same click that opened the dropdown
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const actual = parseFloat(phase.actualHours);
  const estimated = parseFloat(phase.estimatedHours);
  const totalCrHours = parseFloat(crImpact.totalHours);
  const totalCharged = parseFloat(crImpact.totalCharged);
  const totalAbsorbed = parseFloat(crImpact.totalAbsorbed);

  return (
    <div ref={ref} className="absolute z-50 top-full left-0 right-0 mt-1 w-72 bg-[#021b33] text-white rounded-lg shadow-xl p-3">
      {/* Arrow */}
      <div className="absolute bottom-full right-4 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-[#021b33]" />

      {/* Phase header */}
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/20">
        <span className="text-xs font-semibold">{phase.name}</span>
        <span className="text-xs">
          {actual.toFixed(1)}h / {estimated.toFixed(1)}h
        </span>
      </div>

      {/* CR list */}
      <p className="text-[10px] text-white/60 font-semibold mb-1.5 uppercase tracking-wide">
        Solicitudes de Cambio ({crImpact.count})
      </p>
      <div className="space-y-1.5">
        {crImpact.items.map((item) => (
          <div key={item.crId} className="flex items-start justify-between gap-2">
            <span className="text-[11px] text-white/90 line-clamp-1 flex-1">
              {item.description}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] font-medium">+{parseFloat(item.estimatedHours).toFixed(1)}h</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                item.isCharged
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-red-500/20 text-red-300"
              }`}>
                {item.isCharged ? "COBRADO" : "ABSORB."}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="mt-2 pt-2 border-t border-white/20 flex items-center justify-between text-[11px]">
        <span className="text-white/60">Total CR:</span>
        <div className="flex items-center gap-3">
          <span className="font-medium">+{totalCrHours.toFixed(1)}h</span>
          {totalCharged > 0 && (
            <span className="text-emerald-300">${totalCharged.toLocaleString("es-MX")} cobrado</span>
          )}
          {totalAbsorbed > 0 && (
            <span className="text-red-300">${totalAbsorbed.toLocaleString("es-MX")} absorbido</span>
          )}
        </div>
      </div>

      {/* Invoice action */}
      <button
        type="button"
        onClick={() => {
          onClose();
          onOpenInvoice();
        }}
        className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-white/80 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
      >
        <FileText size={11} />
        Ver Facturacion
      </button>
    </div>
  );
}

function PhaseRow({
  phase,
  index,
  hourlyRate,
  crOpen,
  onToggleCr,
  onOpenInvoice,
}: {
  phase: Phase;
  index: number;
  hourlyRate: number;
  crOpen: boolean;
  onToggleCr: () => void;
  onOpenInvoice: () => void;
}) {
  const actual = parseFloat(phase.actualHours);
  const estimated = parseFloat(phase.estimatedHours);
  const overconsumed = actual > estimated && estimated > 0;
  const hoursPct = estimated > 0 ? (actual / estimated) * 100 : 0;

  const actualCost = actual * hourlyRate;
  const estimatedCost = estimated * hourlyRate;
  const costOver = actualCost > estimatedCost && estimatedCost > 0;

  const hasCrImpact = phase.crImpact.count > 0;

  // Bar color: green = paid, red = work without payment, gray = no work
  const barColor = phase.isPaid ? "#10B981" : actual > 0 ? "#EF4444" : "#94A3B8";

  function handleRowClick() {
    if (hasCrImpact) {
      onToggleCr();
    } else {
      onOpenInvoice();
    }
  }

  return (
    <div
      className="relative py-2 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-slate-50 rounded-lg transition-colors -mx-1 px-1"
      onClick={handleRowClick}
    >
      <div className="flex items-center gap-2">
        {phase.isPaid ? (
          <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
        ) : (
          <Circle size={15} className="text-slate-300 shrink-0" />
        )}
        <span className="text-xs font-semibold text-gray-800 truncate flex-1">
          {index + 1}. {phase.name}
        </span>
        {hasCrImpact && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 shrink-0">
            CR
          </span>
        )}
        <span className={`text-xs font-bold shrink-0 ${overconsumed ? "text-red-600" : "text-gray-700"}`}>
          {actual.toFixed(0)}/{estimated.toFixed(0)}h
        </span>
      </div>

      <div className="mt-1 ml-[23px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.min(hoursPct, 100)}%`,
            backgroundColor: barColor,
          }}
        />
      </div>

      <div className="mt-0.5 ml-[23px] text-right">
        <span className={`text-[10px] font-medium ${costOver ? "text-red-500" : "text-slate-400"}`}>
          {formatMoney(actualCost)} / {formatMoney(estimatedCost)}
        </span>
      </div>

      {/* CR Dropdown on click */}
      {hasCrImpact && crOpen && (
        <PhaseCrDropdown
          phase={phase}
          hourlyRate={hourlyRate}
          onClose={onToggleCr}
          onOpenInvoice={onOpenInvoice}
        />
      )}
    </div>
  );
}

export default function ProjectPhasesCard({ projectId }: { projectId: number }) {
  const { data: project, isLoading } = useProjectDetail(projectId);
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [anticipoDialogOpen, setAnticipoDialogOpen] = useState(false);
  const [openCrPhaseId, setOpenCrPhaseId] = useState<number | null>(null);

  function openPhaseDialog(phase: Phase) {
    setSelectedPhase(phase);
    setDialogOpen(true);
  }

  function closePhaseDialog() {
    setDialogOpen(false);
    setSelectedPhase(null);
  }

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

  const totalActualCost = parseFloat(project?.actualCost ?? "0");
  const totalConsumed = parseFloat(project?.consumedHours ?? "0");
  const hourlyRate = totalConsumed > 0 ? totalActualCost / totalConsumed : 0;

  const totalInvoice = parseFloat(project?.clientInvoiceAmount ?? "0");

  const { totalPaid, paidPct, lastCoveredIndex, nextPhase, nextAmount } =
    computeCoverage(phases, totalInvoice);

  const hasAnticipo = !!project?.anticipoAmount;
  const anticipoNum = parseFloat(project?.anticipoAmount ?? "0");
  const anticipoPct = totalInvoice > 0 ? (anticipoNum / totalInvoice) * 100 : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-900">Etapas del Proyecto</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAnticipoDialogOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              hasAnticipo
                ? "text-slate-600 bg-slate-100 hover:bg-slate-200"
                : "text-white bg-primary hover:bg-primary/90"
            }`}
          >
            {hasAnticipo ? (
              <>
                <Pencil size={12} />
                Anticipo
              </>
            ) : (
              <>
                <Plus size={14} />
                Registrar Anticipo
              </>
            )}
          </button>
        </div>
      </div>

      {/* Anticipo summary — compact 2-line */}
      {hasAnticipo && (
        <div className="mb-3 bg-slate-50 rounded-lg px-3 py-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                ANTICIPO
              </span>
              <span className="text-[11px] font-medium text-emerald-600">
                {formatMoneyFull(anticipoNum)} ({anticipoPct.toFixed(1)}%)
              </span>
              {project?.anticipoFileUrl && (
                <a
                  href={project.anticipoFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 transition-colors"
                  title="Ver factura"
                >
                  <FileText size={11} />
                </a>
              )}
            </div>
            {nextPhase && (
              <span className="text-[10px] text-slate-400">
                Prox. pago: S{lastCoveredIndex + 2}
              </span>
            )}
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${Math.min(paidPct, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Coverage summary (no anticipo but has paid phases) */}
      {!hasAnticipo && totalPaid > 0 && (
        <div className="mb-3 bg-slate-50 rounded-lg px-3 py-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">
              Cobrado: {formatMoneyFull(totalPaid)} ({paidPct.toFixed(0)}%)
            </span>
            {nextPhase && (
              <span className="text-[10px] text-slate-400">
                Prox. pago: S{lastCoveredIndex + 2}
              </span>
            )}
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${Math.min(paidPct, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Phase list */}
      <div>
        {phases.map((phase, i) => (
          <PhaseRow
            key={phase.id}
            phase={phase}
            index={i}
            hourlyRate={hourlyRate}
            crOpen={openCrPhaseId === phase.id}
            onToggleCr={() => setOpenCrPhaseId(openCrPhaseId === phase.id ? null : phase.id)}
            onOpenInvoice={() => openPhaseDialog(phase)}
          />
        ))}
      </div>

      {/* Invoice Dialog */}
      {selectedPhase && (
        <PhaseInvoiceDialog
          open={dialogOpen}
          onClose={closePhaseDialog}
          phase={selectedPhase}
          projectId={projectId}
          hourlyRate={hourlyRate}
        />
      )}

      {/* Anticipo Dialog */}
      <AnticipoDialog
        open={anticipoDialogOpen}
        onClose={() => setAnticipoDialogOpen(false)}
        projectId={projectId}
        clientInvoiceAmount={totalInvoice}
        currentAmount={project?.anticipoAmount ?? null}
        currentDate={project?.anticipoDate ?? null}
        currentFileUrl={project?.anticipoFileUrl ?? null}
      />
    </div>
  );
}

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertCircle, ChevronDown, ChevronRight, FileEdit, FileText, Plus } from "lucide-react";
import { useSprints } from "@hooks/useSprints";
import { formatHoursMinutes } from "@services/formatters";
import type { Phase, SprintDetail } from "@types/finance";
import AdvanceDialog from "./dialogs/AdvanceDialog";
import AdvanceReviewDialog from "./dialogs/AdvanceReviewDialog";
import SimpleChangeDialog from "./dialogs/SimpleChangeDialog";
import ChangeRequestDialog from "./dialogs/ChangeRequestDialog";

const COLLABORATOR_COLORS = ["#6278fb", "#00e7ba", "#67adee", "#f59e0b", "#ec4899"];

const sprintStatusConfig = {
  planned: { label: "Planeado", bg: "bg-slate-100", text: "text-slate-600", dotClass: "bg-slate-300" },
  in_progress: { label: "En Progreso", bg: "bg-blue-100", text: "text-blue-700", dotClass: "bg-blue-500 animate-pulse" },
  completed: { label: "Completado", bg: "bg-emerald-100", text: "text-emerald-700", dotClass: "bg-emerald-500" },
} as const;

const deliverableStatusConfig = {
  pendiente: { label: "Pendiente", bg: "bg-slate-100", text: "text-slate-500" },
  en_proceso: { label: "En Proceso", bg: "bg-blue-100", text: "text-blue-700" },
  aceptado: { label: "Aceptado", bg: "bg-emerald-100", text: "text-emerald-700" },
} as const;

type DeliverableStatus = keyof typeof deliverableStatusConfig;

/** Tasks with these patterns are internal (management/research), not client-facing deliverables */
const MANAGEMENT_PATTERNS = ["GESTION", "KICK", "MISC", "INV-"];

function isDeliverableTask(jiraKey: string): boolean {
  const upper = jiraKey.toUpperCase();
  return !MANAGEMENT_PATTERNS.some((p) => upper.includes(p));
}

const simpleChangeStatusConfig = {
  in_process: { label: "En Proceso", bg: "bg-blue-100", text: "text-blue-700" },
  pending_review: { label: "Pendiente de Revision", bg: "bg-amber-100", text: "text-amber-700" },
  accepted: { label: "Aceptado", bg: "bg-emerald-100", text: "text-emerald-700" },
  rejected: { label: "Rechazado", bg: "bg-red-100", text: "text-red-700" },
} as const;

const changeRequestStatusConfig = {
  in_review: { label: "En Revision", bg: "bg-blue-100", text: "text-blue-700" },
  accepted: { label: "Aceptado", bg: "bg-emerald-100", text: "text-emerald-700" },
  to_start: { label: "Por Iniciar", bg: "bg-purple-100", text: "text-purple-700" },
  in_process: { label: "En Proceso", bg: "bg-indigo-100", text: "text-indigo-700" },
  pending_acceptance: { label: "Pendiente de Aceptacion", bg: "bg-amber-100", text: "text-amber-700" },
  completed: { label: "Completado", bg: "bg-emerald-100", text: "text-emerald-700" },
} as const;

function StatusPill({ config }: { config: { label: string; bg: string; text: string } }) {
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

function getSprintHours(sprint: SprintDetail): number {
  return sprint.timeEntries.reduce((acc, te) => acc + parseFloat(te.durationHours), 0);
}

/* ── Collapsible section ── */
function CollapsibleSection({
  title,
  icon,
  count,
  defaultOpen,
  action,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  defaultOpen: boolean;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 group"
        >
          {open
            ? <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
            : <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" />}
          {icon}
          <span className="text-sm font-semibold text-gray-900">
            {title} ({count})
          </span>
        </button>
        {action}
      </div>
      {open && <div className="mt-3 ml-5">{children}</div>}
    </div>
  );
}

/* ── Active sprint content ── */
function SprintContent({
  sprint,
  projectId,
  phases,
}: {
  sprint: SprintDetail;
  projectId: number;
  phases: Phase[];
}) {
  const [advanceDialogOpen, setAdvanceDialogOpen] = useState(false);
  const [reviewAdvanceId, setReviewAdvanceId] = useState<number | null>(null);
  const [reviewSimpleChangeId, setReviewSimpleChangeId] = useState<number | null>(null);
  const [changeRequestDialogOpen, setChangeRequestDialogOpen] = useState(false);
  const sConfig = sprintStatusConfig[sprint.status];
  const totalHours = getSprintHours(sprint);

  const { chartData, collaborators } = useMemo(() => {
    const collabSet = new Set<string>();
    sprint.tasks.forEach((t) => {
      if (t.assignedTo) collabSet.add(t.assignedTo);
    });
    const collabs = Array.from(collabSet);

    const data = sprint.tasks.map((task) => {
      const entry: Record<string, any> = { name: task.jiraKey };
      collabs.forEach((c) => { entry[c] = 0; });
      if (task.assignedTo) {
        entry[task.assignedTo] = parseFloat(task.hours);
      }
      return entry;
    });
    return { chartData: data, collaborators: collabs };
  }, [sprint.tasks]);

  // Merge tasks + advances into deliverables (only client-facing tasks, no GESTION/KICK/MISC)
  const deliverables = useMemo(() => {
    const deliverableTasks = sprint.tasks.filter((t) => isDeliverableTask(t.jiraKey));
    const taskKeys = new Set(deliverableTasks.map((t) => t.jiraKey));

    const items = deliverableTasks.map((task) => {
      const advance = sprint.advances.find((a) => a.taskJiraKey === task.jiraKey);
      const status: DeliverableStatus = advance
        ? advance.status === "accepted" ? "aceptado" : "en_proceso"
        : "pendiente";
      return {
        key: task.jiraKey,
        description: advance?.description ?? task.title,
        assignedTo: task.assignedTo,
        date: task.date,
        status,
        advanceId: advance?.id,
      };
    });

    // Orphan advances for deliverable keys not in sprint.tasks
    sprint.advances
      .filter((a) => !taskKeys.has(a.taskJiraKey) && isDeliverableTask(a.taskJiraKey))
      .forEach((adv) => {
        items.push({
          key: adv.taskJiraKey,
          description: adv.description,
          assignedTo: adv.presentedBy,
          date: adv.createdAt?.split("T")[0] ?? null,
          status: adv.status === "accepted" ? "aceptado" as const : "en_proceso" as const,
          advanceId: adv.id,
        });
      });

    return items;
  }, [sprint.tasks, sprint.advances]);

  const acceptedCount = deliverables.filter((d) => d.status === "aceptado").length;

  const reviewingAdvance = sprint.advances.find((a) => a.id === reviewAdvanceId);
  const reviewingSimpleChange = sprint.simpleChanges.find((c) => c.id === reviewSimpleChangeId);

  const dateStr = sprint.startDate && sprint.endDate
    ? `${new Date(sprint.startDate + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" })} – ${new Date(sprint.endDate + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}`
    : null;

  return (
    <div className="space-y-5 pt-5">
      {/* ── Header: clean, no card wrapper ── */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h4 className="text-sm font-semibold text-gray-900">{sprint.name}</h4>
            <StatusPill config={sConfig} />
          </div>
          <div className="text-right shrink-0 pl-4">
            <span className="text-base font-bold text-gray-900">
              {formatHoursMinutes(totalHours)}
            </span>
          </div>
        </div>
        {dateStr && (
          <p className="text-[11px] text-slate-400 mt-1">{dateStr}</p>
        )}
      </div>

      {/* ── Two columns: Chart + Advances ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Bar chart (3/5) */}
        {chartData.length > 0 && (
          <div className="lg:col-span-3 rounded-xl border border-gray-200 p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              Distribucion de Horas por Tarea y Colaborador
            </h4>
            <p className="text-[10px] text-slate-400 mb-3">
              {sprint.tasks.length} tareas &middot; {collaborators.length} colaboradores
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "#64748B" }}
                  angle={-15}
                  textAnchor="end"
                  height={40}
                />
                <YAxis tick={{ fontSize: 10, fill: "#64748B" }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {collaborators.map((name, i) => (
                  <Bar
                    key={name}
                    dataKey={name}
                    stackId="hours"
                    fill={COLLABORATOR_COLORS[i % COLLABORATOR_COLORS.length]}
                    radius={i === collaborators.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Avances — vista de entregables para el cliente */}
        <div className={chartData.length > 0 ? "lg:col-span-2" : "lg:col-span-5"}>
          <div className="rounded-xl border border-gray-200 p-4 h-full">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText size={15} style={{ color: "#00e7ba" }} />
                <h4 className="text-sm font-semibold text-gray-900">
                  Avances
                  <span className="font-normal text-slate-400 ml-1">
                    {acceptedCount}/{deliverables.length}
                  </span>
                </h4>
              </div>
              <button
                onClick={() => setAdvanceDialogOpen(true)}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <Plus size={13} /> Registrar
              </button>
            </div>
            {deliverables.length === 0 ? (
              <p className="text-xs text-slate-400 bg-slate-50 rounded-lg p-3 text-center">
                Sin tareas en este sprint.
              </p>
            ) : (
              <div className="space-y-1.5">
                {deliverables.map((item) => (
                  <div
                    key={item.key}
                    className={`rounded-lg px-3 py-2.5 border ${
                      item.status === "aceptado"
                        ? "border-emerald-100 bg-emerald-50/50"
                        : "border-gray-100 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-semibold text-primary">
                        {item.key}
                      </span>
                      <StatusPill config={deliverableStatusConfig[item.status]} />
                    </div>
                    <p className="text-xs text-gray-700 mt-0.5 line-clamp-1">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span>{item.assignedTo}</span>
                        {item.date && (
                          <>
                            <span>&middot;</span>
                            <span>
                              {new Date(item.date + "T00:00:00").toLocaleDateString("es-MX", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </>
                        )}
                      </div>
                      {item.status === "en_proceso" && item.advanceId && (
                        <button
                          onClick={() => setReviewAdvanceId(item.advanceId!)}
                          className="text-[10px] font-medium text-primary hover:underline"
                        >
                          Revisar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Collapsible: Simple Changes ── */}
      <CollapsibleSection
        title="Cambios Simples"
        icon={<AlertCircle size={15} className="text-amber-500" />}
        count={sprint.simpleChanges.length}
        defaultOpen={sprint.simpleChanges.length > 0}
      >
        {sprint.simpleChanges.length === 0 ? (
          <p className="text-xs text-slate-400 bg-slate-50 rounded-lg p-3 text-center">
            Sin cambios simples en este sprint.
          </p>
        ) : (
          <div className="space-y-2">
            {sprint.simpleChanges.map((change) => (
              <div key={change.id} className="bg-amber-50 rounded-lg border border-amber-200 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-semibold text-primary">
                    {change.taskJiraKey}
                  </span>
                  <div className="flex items-center gap-2">
                    {change.draggedFromSprint && (
                      <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded">
                        Arrastrado
                      </span>
                    )}
                    <StatusPill config={simpleChangeStatusConfig[change.status]} />
                  </div>
                </div>
                <p className="text-xs text-gray-700">{change.description}</p>
                {change.reviewComments && (
                  <div className="mt-2 bg-white border border-gray-200 rounded p-2">
                    <p className="text-[10px] font-semibold text-slate-500">Comentarios:</p>
                    <p className="text-xs text-slate-700">{change.reviewComments}</p>
                  </div>
                )}
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[10px] text-slate-400">
                    {new Date(change.createdAt).toLocaleDateString("es-MX")}
                  </p>
                  {change.status === "pending_review" && (
                    <button
                      onClick={() => setReviewSimpleChangeId(change.id)}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Revisar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CollapsibleSection>

      {/* ── Collapsible: Change Requests ── */}
      <CollapsibleSection
        title="Solicitudes de Cambio"
        icon={<FileEdit size={15} className="text-primary" />}
        count={sprint.changeRequests.length}
        defaultOpen={sprint.changeRequests.length > 0}
        action={
          <button
            onClick={() => setChangeRequestDialogOpen(true)}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <Plus size={13} /> Nueva
          </button>
        }
      >
        {sprint.changeRequests.length === 0 ? (
          <p className="text-xs text-slate-400 bg-slate-50 rounded-lg p-3 text-center">
            Sin solicitudes de cambio.
          </p>
        ) : (
          <div className="space-y-2">
            {sprint.changeRequests.map((cr) => (
              <div key={cr.id} className="bg-blue-50 rounded-lg border border-blue-200 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-800">{cr.description}</span>
                  <div className="flex items-center gap-1.5">
                    {cr.isCharged ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                        COBRADO
                      </span>
                    ) : cr.status !== "in_review" ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-600">
                        ABSORBIDO
                      </span>
                    ) : null}
                    <StatusPill config={changeRequestStatusConfig[cr.status]} />
                  </div>
                </div>
                {cr.detail && <p className="text-xs text-gray-600 mt-1">{cr.detail}</p>}
                {cr.dependencies && (
                  <div className="mt-2 bg-white border border-gray-200 rounded p-2">
                    <p className="text-[10px] font-semibold text-slate-500">Dependencias:</p>
                    <p className="text-xs text-slate-700">{cr.dependencies}</p>
                  </div>
                )}
                {cr.impact && (
                  <div className="mt-2 bg-white border border-gray-200 rounded p-2">
                    <p className="text-[10px] font-semibold text-slate-500">Impacto:</p>
                    <p className="text-xs text-slate-700">{cr.impact}</p>
                  </div>
                )}
                {cr.phaseImpacts.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {cr.phaseImpacts.map((pi) => (
                      <span key={pi.phase} className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
                        S{pi.phaseSortOrder}: {pi.estimatedHours}h
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between mt-2">
                  {cr.estimatedHours && (
                    <p className="text-xs text-primary">
                      Horas estimadas: {cr.estimatedHours}h
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400">
                    {new Date(cr.createdAt).toLocaleDateString("es-MX")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CollapsibleSection>

      {/* ── Dialogs ── */}
      <AdvanceDialog
        open={advanceDialogOpen}
        onClose={() => setAdvanceDialogOpen(false)}
        sprintId={sprint.id}
        projectId={projectId}
      />
      {reviewingAdvance && (
        <AdvanceReviewDialog
          open={!!reviewAdvanceId}
          onClose={() => setReviewAdvanceId(null)}
          advance={reviewingAdvance}
          projectId={projectId}
        />
      )}
      {reviewingSimpleChange && (
        <SimpleChangeDialog
          open={!!reviewSimpleChangeId}
          onClose={() => setReviewSimpleChangeId(null)}
          change={reviewingSimpleChange}
          projectId={projectId}
        />
      )}
      <ChangeRequestDialog
        open={changeRequestDialogOpen}
        onClose={() => setChangeRequestDialogOpen(false)}
        sprintId={sprint.id}
        projectId={projectId}
        phases={phases}
      />
    </div>
  );
}

/* ── Main section ── */
export default function SprintsSection({ projectId, phases }: { projectId: number; phases?: Phase[] }) {
  const { data: sprints = [], isLoading } = useSprints(projectId);
  const [activeId, setActiveId] = useState<number | null>(null);

  const activeSprint = sprints.find((s) => s.id === (activeId ?? sprints[0]?.id));

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="h-5 w-48 bg-gray-200 rounded mb-4" />
        <div className="h-64 bg-gray-100 rounded" />
      </div>
    );
  }

  if (sprints.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
        <p className="text-sm text-slate-500">No hay sprints configurados para este proyecto.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-900">Gestion de Sprints</h3>
      <p className="text-xs text-slate-500 mt-0.5 mb-4">
        Seguimiento detallado de entregas, ajustes y cambios de alcance
      </p>

      {/* ── Underline tabs: clean, scannable ── */}
      <div className="flex items-center border-b border-gray-200 overflow-x-auto">
        {sprints.map((sprint) => {
          const isActive = sprint.id === (activeId ?? sprints[0]?.id);
          const cfg = sprintStatusConfig[sprint.status];
          const hours = getSprintHours(sprint);

          // Red dot if matching phase has work but is unpaid
          const matchPhase = phases?.find((p) => p.sortOrder === sprint.sortOrder);
          const paymentOverdue = matchPhase && !matchPhase.isPaid && parseFloat(matchPhase.actualHours) > 0;
          const dotClass = paymentOverdue ? "bg-red-500" : cfg.dotClass;

          return (
            <button
              key={sprint.id}
              onClick={() => setActiveId(sprint.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                isActive
                  ? paymentOverdue ? "border-red-500 text-red-600" : "border-primary text-primary"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />
              Sprint {sprint.sortOrder}
              {hours > 0 && (
                <span className={`font-normal ${isActive ? "text-primary/50" : "text-slate-300"}`}>
                  {formatHoursMinutes(hours)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Active sprint content ── */}
      {activeSprint && (
        <SprintContent sprint={activeSprint} projectId={projectId} phases={phases ?? []} />
      )}
    </div>
  );
}

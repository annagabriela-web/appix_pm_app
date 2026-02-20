import { useState } from "react";
import {
  AlertTriangle,
  CheckSquare,
  Clock,
  DollarSign,
  MoreHorizontal,
  Package,
  Target,
  Users,
} from "lucide-react";
import Dialog from "@components/ui/Dialog";
import { useCreateChangeRequest } from "@hooks/useSprints";
import type { Phase } from "@types/finance";

interface ChangeRequestDialogProps {
  open: boolean;
  onClose: () => void;
  sprintId: number;
  projectId: number;
  phases: Phase[];
}

const inputBase =
  "w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none placeholder:text-gray-400";

export default function ChangeRequestDialog({ open, onClose, sprintId, projectId, phases }: ChangeRequestDialogProps) {
  const [description, setDescription] = useState("");
  const [detail, setDetail] = useState("");

  // Dependencies (4 sub-fields)
  const [depTeam, setDepTeam] = useState("");
  const [depApproval, setDepApproval] = useState("");
  const [depResources, setDepResources] = useState("");
  const [depOther, setDepOther] = useState("");

  // Impact (3 sub-fields)
  const [impactHours, setImpactHours] = useState("");
  const [impactCost, setImpactCost] = useState("");
  const [impactScope, setImpactScope] = useState("");

  // Charging
  const [isCharged, setIsCharged] = useState(false);
  const [chargedAmount, setChargedAmount] = useState("");

  // Affected phases
  const [phaseImpacts, setPhaseImpacts] = useState<Array<{ phaseId: number; hours: string }>>([]);

  const { mutate, isPending } = useCreateChangeRequest(projectId);

  const canSubmit = description.trim() && !isPending;

  function buildDependencies(): string | undefined {
    const parts = [
      depTeam.trim() && `Equipo: ${depTeam.trim()}`,
      depApproval.trim() && `Aprobacion: ${depApproval.trim()}`,
      depResources.trim() && `Recursos: ${depResources.trim()}`,
      depOther.trim() && `Otros: ${depOther.trim()}`,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join("\n") : undefined;
  }

  function buildImpact(): string | undefined {
    const parts = [
      impactHours.trim() && `Horas/Entregables: ${impactHours.trim()}`,
      impactCost.trim() && `Costo: ${impactCost.trim()}`,
      impactScope.trim() && `Alcance: ${impactScope.trim()}`,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join("\n") : undefined;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    const validImpacts = phaseImpacts
      .filter((pi) => pi.hours && parseFloat(pi.hours) > 0)
      .map((pi) => ({ phase: pi.phaseId, estimatedHours: pi.hours }));

    mutate(
      {
        sprint: sprintId,
        description: description.trim(),
        detail: detail.trim() || undefined,
        dependencies: buildDependencies(),
        impact: buildImpact(),
        isCharged,
        chargedAmount: isCharged && chargedAmount ? chargedAmount : undefined,
        phaseImpacts: validImpacts.length > 0 ? validImpacts : undefined,
      },
      {
        onSuccess: () => {
          setDescription("");
          setDetail("");
          setDepTeam("");
          setDepApproval("");
          setDepResources("");
          setDepOther("");
          setImpactHours("");
          setImpactCost("");
          setImpactScope("");
          setIsCharged(false);
          setChargedAmount("");
          setPhaseImpacts([]);
          onClose();
        },
      }
    );
  }

  return (
    <Dialog open={open} onClose={onClose} title="Nueva Solicitud de Cambio" width="xl">
      <form onSubmit={handleSubmit}>
        {/* Banner */}
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
          <AlertTriangle size={14} className="text-amber-500 shrink-0" />
          <p className="text-[11px] text-amber-700">
            <span className="font-semibold">Cambio de alcance</span> — sera evaluado por el equipo antes de su ejecucion.
          </p>
        </div>

        {/* Title + Detail */}
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Titulo <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Traducciones del catalogo al ingles"
              className={inputBase}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Detalle
            </label>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              rows={2}
              placeholder="Que se solicita, por que y que areas impacta..."
              className={`${inputBase} resize-none`}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 mb-4" />

        {/* Dependencies + Impact — 2 columns */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          {/* Dependencies column */}
          <div>
            <p className="text-xs font-medium text-gray-700 mb-2">Dependencias</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users size={12} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={depTeam}
                  onChange={(e) => setDepTeam(e.target.value)}
                  placeholder="Equipo necesario..."
                  className={inputBase}
                />
              </div>
              <div className="flex items-center gap-2">
                <CheckSquare size={12} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={depApproval}
                  onChange={(e) => setDepApproval(e.target.value)}
                  placeholder="Equipo aprueba horas/alcance, cliente valida..."
                  className={inputBase}
                />
              </div>
              <div className="flex items-center gap-2">
                <Package size={12} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={depResources}
                  onChange={(e) => setDepResources(e.target.value)}
                  placeholder="Recursos o herramientas..."
                  className={inputBase}
                />
              </div>
              <div className="flex items-center gap-2">
                <MoreHorizontal size={12} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={depOther}
                  onChange={(e) => setDepOther(e.target.value)}
                  placeholder="Otras dependencias..."
                  className={inputBase}
                />
              </div>
            </div>
          </div>

          {/* Impact column */}
          <div>
            <p className="text-xs font-medium text-gray-700 mb-2">Impacto en el proyecto</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock size={12} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={impactHours}
                  onChange={(e) => setImpactHours(e.target.value)}
                  placeholder="Horas y entregables afectados..."
                  className={inputBase}
                />
              </div>
              <div className="flex items-center gap-2">
                <DollarSign size={12} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={impactCost}
                  onChange={(e) => setImpactCost(e.target.value)}
                  placeholder="Costo adicional estimado..."
                  className={inputBase}
                />
              </div>
              <div className="flex items-center gap-2">
                <Target size={12} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={impactScope}
                  onChange={(e) => setImpactScope(e.target.value)}
                  placeholder="Como cambia el alcance..."
                  className={inputBase}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 mb-4" />

        {/* Affected Phases */}
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-700 mb-1">Etapas Afectadas</p>
          <p className="text-[10px] text-slate-400 mb-2">
            Seleccione las etapas impactadas y las horas estimadas por etapa.
          </p>
          <div className="space-y-2">
            {phases.map((phase) => {
              const existing = phaseImpacts.find((pi) => pi.phaseId === phase.id);
              const isSelected = !!existing;
              return (
                <div key={phase.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPhaseImpacts([...phaseImpacts, { phaseId: phase.id, hours: "" }]);
                      } else {
                        setPhaseImpacts(phaseImpacts.filter((pi) => pi.phaseId !== phase.id));
                      }
                    }}
                    className="rounded border-gray-300 text-primary focus:ring-primary/30"
                  />
                  <span className="text-xs text-gray-700 flex-1">
                    S{phase.sortOrder} - {phase.name}
                  </span>
                  {isSelected && (
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={existing!.hours}
                      onChange={(e) =>
                        setPhaseImpacts(
                          phaseImpacts.map((pi) =>
                            pi.phaseId === phase.id ? { ...pi, hours: e.target.value } : pi
                          )
                        )
                      }
                      placeholder="Horas"
                      className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-xs text-right focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Charging toggle */}
        <div className="mb-5 flex items-center gap-3 bg-slate-50 rounded-lg p-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isCharged}
              onChange={(e) => setIsCharged(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary/30"
            />
            <span className="text-xs font-medium text-gray-700">Se cobra al cliente</span>
          </label>
          {isCharged && (
            <div className="flex items-center gap-1">
              <DollarSign size={12} className="text-slate-400" />
              <input
                type="number"
                step="0.01"
                min="0"
                value={chargedAmount}
                onChange={(e) => setChargedAmount(e.target.value)}
                placeholder="Monto $"
                className="w-28 rounded-lg border border-gray-300 px-2 py-1 text-xs focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="px-5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isPending ? "Creando..." : "Crear Solicitud"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

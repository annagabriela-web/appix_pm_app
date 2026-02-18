import { useState } from "react";
import Dialog from "@components/ui/Dialog";
import { useCreateChangeRequest } from "@hooks/useSprints";

interface ChangeRequestDialogProps {
  open: boolean;
  onClose: () => void;
  sprintId: number;
  projectId: number;
}

export default function ChangeRequestDialog({ open, onClose, sprintId, projectId }: ChangeRequestDialogProps) {
  const [description, setDescription] = useState("");
  const [detail, setDetail] = useState("");
  const [dependencies, setDependencies] = useState("");
  const [impact, setImpact] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");

  const { mutate, isPending } = useCreateChangeRequest(projectId);

  const canSubmit = description.trim() && !isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    mutate(
      {
        sprint: sprintId,
        description: description.trim(),
        detail: detail.trim() || undefined,
        dependencies: dependencies.trim() || undefined,
        impact: impact.trim() || undefined,
        estimatedHours: estimatedHours.trim() || undefined,
      },
      {
        onSuccess: () => {
          setDescription("");
          setDetail("");
          setDependencies("");
          setImpact("");
          setEstimatedHours("");
          onClose();
        },
      }
    );
  }

  return (
    <Dialog open={open} onClose={onClose} title="Nueva Solicitud de Cambio" width="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Descripcion *
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Titulo de la solicitud de cambio"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Detalle
          </label>
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            rows={3}
            placeholder="Descripcion detallada del cambio solicitado..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Dependencias
            </label>
            <textarea
              value={dependencies}
              onChange={(e) => setDependencies(e.target.value)}
              rows={2}
              placeholder="Tareas o recursos necesarios..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Impacto
            </label>
            <textarea
              value={impact}
              onChange={(e) => setImpact(e.target.value)}
              rows={2}
              placeholder="Impacto en el proyecto..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Horas Estimadas
          </label>
          <input
            type="number"
            step="0.5"
            min="0"
            value={estimatedHours}
            onChange={(e) => setEstimatedHours(e.target.value)}
            placeholder="0"
            className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "Guardando..." : "Crear Solicitud"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

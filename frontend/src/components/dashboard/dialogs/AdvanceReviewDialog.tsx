import { useState } from "react";
import Dialog from "@components/ui/Dialog";
import { useReviewAdvance } from "@hooks/useSprints";
import type { Advance } from "@types/finance";

interface AdvanceReviewDialogProps {
  open: boolean;
  onClose: () => void;
  advance: Advance;
  projectId: number;
}

export default function AdvanceReviewDialog({ open, onClose, advance, projectId }: AdvanceReviewDialogProps) {
  const [observations, setObservations] = useState("");
  const { mutate, isPending } = useReviewAdvance(projectId);

  function handleAction(status: "accepted" | "pending") {
    mutate(
      { id: advance.id, status, observations: observations.trim() || undefined },
      {
        onSuccess: () => {
          setObservations("");
          onClose();
        },
      }
    );
  }

  return (
    <Dialog open={open} onClose={onClose} title="Revisar Avance">
      <div className="space-y-4">
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs font-semibold text-primary">{advance.taskJiraKey}</span>
            <span className="text-[10px] text-slate-400">por {advance.presentedBy}</span>
          </div>
          <p className="text-sm text-gray-700">{advance.description}</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Observaciones (opcional)
          </label>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            rows={3}
            placeholder="Agrega observaciones o comentarios..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => handleAction("pending")}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 disabled:opacity-50 transition-colors"
          >
            Solicitar Cambios
          </button>
          <button
            type="button"
            onClick={() => handleAction("accepted")}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors"
          >
            {isPending ? "Guardando..." : "Aceptar"}
          </button>
        </div>
      </div>
    </Dialog>
  );
}

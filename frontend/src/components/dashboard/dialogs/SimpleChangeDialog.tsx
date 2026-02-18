import { useState } from "react";
import Dialog from "@components/ui/Dialog";
import { useReviewSimpleChange } from "@hooks/useSprints";
import type { SimpleChangeRequest } from "@types/finance";

interface SimpleChangeDialogProps {
  open: boolean;
  onClose: () => void;
  change: SimpleChangeRequest;
  projectId: number;
}

const statusActions = [
  { status: "accepted", label: "Aceptar", bg: "bg-emerald-500 hover:bg-emerald-600 text-white" },
  { status: "rejected", label: "Rechazar", bg: "bg-red-500 hover:bg-red-600 text-white" },
  { status: "in_process", label: "En Proceso", bg: "bg-blue-500 hover:bg-blue-600 text-white" },
] as const;

export default function SimpleChangeDialog({ open, onClose, change, projectId }: SimpleChangeDialogProps) {
  const [reviewComments, setReviewComments] = useState("");
  const { mutate, isPending } = useReviewSimpleChange(projectId);

  function handleAction(status: SimpleChangeRequest["status"]) {
    mutate(
      { id: change.id, status, reviewComments: reviewComments.trim() || undefined },
      {
        onSuccess: () => {
          setReviewComments("");
          onClose();
        },
      }
    );
  }

  return (
    <Dialog open={open} onClose={onClose} title="Revisar Cambio Simple">
      <div className="space-y-4">
        <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs font-semibold text-primary">{change.taskJiraKey}</span>
            {change.draggedFromSprint && (
              <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded">
                Arrastrado
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700">{change.description}</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Comentarios de Revision (opcional)
          </label>
          <textarea
            value={reviewComments}
            onChange={(e) => setReviewComments(e.target.value)}
            rows={3}
            placeholder="Agrega comentarios de la revision..."
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
          {statusActions.map(({ status, label, bg }) => (
            <button
              key={status}
              type="button"
              onClick={() => handleAction(status)}
              disabled={isPending}
              className={`px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 transition-colors ${bg}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </Dialog>
  );
}

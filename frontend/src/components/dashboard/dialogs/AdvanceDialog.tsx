import { useState } from "react";
import Dialog from "@components/ui/Dialog";
import { useCreateAdvance } from "@hooks/useSprints";

interface AdvanceDialogProps {
  open: boolean;
  onClose: () => void;
  sprintId: number;
  projectId: number;
}

export default function AdvanceDialog({ open, onClose, sprintId, projectId }: AdvanceDialogProps) {
  const [taskJiraKey, setTaskJiraKey] = useState("");
  const [description, setDescription] = useState("");
  const [presentedBy, setPresentedBy] = useState("");

  const { mutate, isPending } = useCreateAdvance(projectId);

  const canSubmit = taskJiraKey.trim() && description.trim() && presentedBy.trim() && !isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    mutate(
      { sprint: sprintId, taskJiraKey: taskJiraKey.trim(), description: description.trim(), presentedBy: presentedBy.trim() },
      {
        onSuccess: () => {
          setTaskJiraKey("");
          setDescription("");
          setPresentedBy("");
          onClose();
        },
      }
    );
  }

  return (
    <Dialog open={open} onClose={onClose} title="Registrar Avance">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Tarea Jira
          </label>
          <input
            type="text"
            value={taskJiraKey}
            onChange={(e) => setTaskJiraKey(e.target.value)}
            placeholder="CAP-123"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Descripcion del Avance
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe el avance realizado..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Presentado por
          </label>
          <input
            type="text"
            value={presentedBy}
            onChange={(e) => setPresentedBy(e.target.value)}
            placeholder="Nombre del colaborador"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
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
            {isPending ? "Guardando..." : "Registrar Avance"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

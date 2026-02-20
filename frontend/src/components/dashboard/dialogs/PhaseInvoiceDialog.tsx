import { useState, useEffect, useRef } from "react";
import { Calendar, CheckCircle2, Circle, DollarSign, FileText, Trash2, Upload } from "lucide-react";
import Dialog from "@components/ui/Dialog";
import { useUpdatePhaseInvoice } from "@hooks/useProjects";
import type { Phase } from "@types/finance";

interface PhaseInvoiceDialogProps {
  open: boolean;
  onClose: () => void;
  phase: Phase;
  projectId: number;
  hourlyRate: number;
}

function formatMoney(n: number): string {
  return n.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function PhaseInvoiceDialog({
  open,
  onClose,
  phase,
  projectId,
  hourlyRate,
}: PhaseInvoiceDialogProps) {
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [clearFile, setClearFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate, isPending, isError } = useUpdatePhaseInvoice(projectId);

  useEffect(() => {
    if (open) {
      setInvoiceAmount(phase.invoiceAmount ?? "");
      setInvoiceDate(phase.invoiceDate ?? "");
      setIsPaid(phase.isPaid);
      setSelectedFile(null);
      setClearFile(false);
    }
  }, [open, phase]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      setSelectedFile(file);
      setClearFile(false);
    }
  }

  function handleRemoveFile() {
    setSelectedFile(null);
    setClearFile(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleCancelNewFile() {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutate(
      {
        phaseId: phase.id,
        invoiceAmount: invoiceAmount.trim() || null,
        invoiceDate: invoiceDate || null,
        isPaid,
        ...(selectedFile ? { invoiceFile: selectedFile } : {}),
        ...(clearFile ? { clearInvoiceFile: true } : {}),
      },
      { onSuccess: () => onClose() }
    );
  }

  const actual = parseFloat(phase.actualHours);
  const estimated = parseFloat(phase.estimatedHours);
  const actualCost = actual * hourlyRate;

  const hasExistingFile = !!phase.invoiceFileUrl && !clearFile;
  const hasNewFile = !!selectedFile;

  return (
    <Dialog open={open} onClose={onClose} title="Facturacion de Etapa">
      <form onSubmit={handleSubmit}>
        {/* Read-only info card */}
        <div className="bg-slate-50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            {phase.isPaid ? (
              <CheckCircle2 size={15} className="text-emerald-500" />
            ) : (
              <Circle size={15} className="text-slate-300" />
            )}
            <span className="text-sm font-semibold text-gray-800">{phase.name}</span>
            <span className={`text-[10px] font-medium ml-auto ${phase.isPaid ? "text-emerald-600" : "text-slate-400"}`}>
              {phase.isPaid ? "Pagada" : "Pendiente"}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] text-slate-400">Horas</p>
              <p className="text-xs font-bold text-gray-700">
                {actual.toFixed(1)} / {estimated.toFixed(1)}h
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Costo Real</p>
              <p className="text-xs font-bold text-gray-700">${formatMoney(actualCost)}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Progreso</p>
              <p className="text-xs font-bold text-gray-700">
                {estimated > 0 ? ((actual / estimated) * 100).toFixed(0) : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Editable fields */}
        <div className="space-y-4 mb-5">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1">
              <DollarSign size={12} className="text-slate-400" />
              Monto Facturado (MXN)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={invoiceAmount}
              onChange={(e) => setInvoiceAmount(e.target.value)}
              placeholder="12000.00"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1">
              <Calendar size={12} className="text-slate-400" />
              Fecha de Factura
            </label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            />
          </div>
          {/* Invoice file upload */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-2">
              <FileText size={12} className="text-slate-400" />
              Archivo de Factura (PDF)
            </label>

            {/* Existing file */}
            {hasExistingFile && !hasNewFile && (
              <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2 mb-2">
                <FileText size={14} className="text-blue-500 shrink-0" />
                <a
                  href={phase.invoiceFileUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline truncate flex-1"
                >
                  Ver factura actual
                </a>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-red-400 hover:text-red-600 transition-colors shrink-0"
                  title="Eliminar archivo"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}

            {/* New file selected */}
            {hasNewFile && (
              <div className="flex items-center gap-2 bg-emerald-50 rounded-lg px-3 py-2 mb-2">
                <FileText size={14} className="text-emerald-500 shrink-0" />
                <span className="text-xs text-emerald-700 truncate flex-1">
                  {selectedFile!.name}
                </span>
                <button
                  type="button"
                  onClick={handleCancelNewFile}
                  className="text-red-400 hover:text-red-600 transition-colors shrink-0"
                  title="Cancelar"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}

            {/* File marked for removal */}
            {clearFile && !hasNewFile && (
              <div className="flex items-center gap-2 bg-amber-50 rounded-lg px-3 py-2 mb-2">
                <Trash2 size={14} className="text-amber-500 shrink-0" />
                <span className="text-xs text-amber-700">
                  El archivo sera eliminado al guardar
                </span>
              </div>
            )}

            {/* Hidden file input + trigger button */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              <Upload size={12} />
              {hasExistingFile || hasNewFile ? "Cambiar archivo" : "Subir factura PDF"}
            </button>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isPaid}
              onChange={(e) => setIsPaid(e.target.checked)}
              className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-500/30 w-4 h-4"
            />
            <span className="text-xs font-medium text-gray-700">Marcar como pagada</span>
          </label>
        </div>

        {isError && (
          <p className="text-xs text-red-500 mb-3">Error al guardar. Verifica los datos.</p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isPending ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

import { useState, useEffect, useRef } from "react";
import { Calendar, DollarSign, FileText, Trash2, Upload } from "lucide-react";
import Dialog from "@components/ui/Dialog";
import { useUpdateAnticipo } from "@hooks/useProjects";

interface AnticipoDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: number;
  clientInvoiceAmount: number;
  currentAmount: string | null;
  currentDate: string | null;
  currentFileUrl: string | null;
}

function formatMoney(n: number): string {
  return n.toLocaleString("es-MX", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default function AnticipoDialog({
  open,
  onClose,
  projectId,
  clientInvoiceAmount,
  currentAmount,
  currentDate,
  currentFileUrl,
}: AnticipoDialogProps) {
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate, isPending, isError } = useUpdateAnticipo(projectId);

  const isEditing = !!currentAmount;

  useEffect(() => {
    if (open) {
      setAmount(currentAmount ?? "");
      setPaymentDate(currentDate ?? "");
      setSelectedFile(null);
    }
  }, [open, currentAmount, currentDate]);

  const amountNum = parseFloat(amount) || 0;
  const pct =
    clientInvoiceAmount > 0 ? (amountNum / clientInvoiceAmount) * 100 : 0;
  const canSubmit = amountNum > 0 && paymentDate && !isPending;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file) setSelectedFile(file);
  }

  function handleRemoveFile() {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    mutate(
      {
        anticipoAmount: amount.trim(),
        anticipoDate: paymentDate,
        ...(selectedFile ? { anticipoFile: selectedFile } : {}),
      },
      { onSuccess: () => onClose() }
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar Anticipo" : "Registrar Anticipo"}
    >
      <form onSubmit={handleSubmit}>
        {/* Live percentage preview */}
        {amountNum > 0 && (
          <div className="bg-emerald-50 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-700">
                ${formatMoney(amountNum)} de ${formatMoney(clientInvoiceAmount)}
              </span>
              <span className="text-sm font-bold text-emerald-600">
                {pct.toFixed(1)}%
              </span>
            </div>
            <div className="h-1.5 bg-emerald-200 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
          </div>
        )}

        <div className="space-y-4 mb-5">
          {/* Amount */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1">
              <DollarSign size={12} className="text-slate-400" />
              Monto del Anticipo (MXN)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="11880.00"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
              autoFocus
            />
          </div>

          {/* Date */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1">
              <Calendar size={12} className="text-slate-400" />
              Fecha de Pago
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            />
          </div>

          {/* File upload */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-2">
              <FileText size={12} className="text-slate-400" />
              Factura del Anticipo (PDF)
            </label>

            {/* Existing file */}
            {currentFileUrl && !selectedFile && (
              <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2 mb-2">
                <FileText size={14} className="text-blue-500 shrink-0" />
                <a
                  href={currentFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline truncate flex-1"
                >
                  Ver factura actual
                </a>
              </div>
            )}

            {/* New file selected */}
            {selectedFile && (
              <div className="flex items-center gap-2 bg-emerald-50 rounded-lg px-3 py-2 mb-2">
                <FileText size={14} className="text-emerald-500 shrink-0" />
                <span className="text-xs text-emerald-700 truncate flex-1">
                  {selectedFile.name}
                </span>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-red-400 hover:text-red-600 transition-colors shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}

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
              {selectedFile || currentFileUrl
                ? "Cambiar archivo"
                : "Subir factura PDF"}
            </button>
          </div>
        </div>

        {isError && (
          <p className="text-xs text-red-500 mb-3">
            Error al guardar. Verifica los datos.
          </p>
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
            disabled={!canSubmit}
            className="px-5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isPending
              ? "Guardando..."
              : isEditing
                ? "Actualizar"
                : "Registrar Anticipo"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

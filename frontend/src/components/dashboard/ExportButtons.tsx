import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { useState } from "react";

interface ExportButtonsProps {
  projectId: number;
}

export default function ExportButtons({ projectId }: ExportButtonsProps) {
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);

  const baseUrl =
    import.meta.env.PUBLIC_API_URL || "http://localhost:8000/api/v1";

  const handleDownload = async (format: "pdf" | "excel") => {
    const setLoading = format === "pdf" ? setLoadingPdf : setLoadingExcel;
    setLoading(true);

    try {
      const url = `${baseUrl}/reports/projects/${projectId}/${format}/`;
      const response = await fetch(url, { credentials: "include" });

      if (!response.ok) throw new Error("Error al generar reporte");

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `proyecto-${projectId}.${format === "pdf" ? "pdf" : "xlsx"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch {
      // Error handling: could show a toast notification
      console.error(`Error exporting ${format}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => void handleDownload("pdf")}
        disabled={loadingPdf}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-neutral hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        {loadingPdf ? (
          <Download size={14} className="animate-bounce" />
        ) : (
          <FileText size={14} />
        )}
        PDF
      </button>
      <button
        onClick={() => void handleDownload("excel")}
        disabled={loadingExcel}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-neutral hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        {loadingExcel ? (
          <Download size={14} className="animate-bounce" />
        ) : (
          <FileSpreadsheet size={14} />
        )}
        Excel
      </button>
    </div>
  );
}

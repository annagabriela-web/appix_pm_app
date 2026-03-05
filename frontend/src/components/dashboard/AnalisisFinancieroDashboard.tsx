import { useState, useEffect } from "react";
import { AlertTriangle, FileText } from "lucide-react";
import { useCeoDashboard } from "@hooks/useCeoDashboard";
import { usePortfolio } from "@hooks/usePortfolio";
import type { HealthStatus } from "@types/finance";
import QueryProvider from "@components/providers/QueryProvider";
import StatusBadge from "./StatusBadge";

function formatMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toLocaleString("es-MX", { maximumFractionDigits: 0 })}`;
}

function formatMoneyFull(n: number): string {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function AnalisisFinancieroInner() {
  const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const [dateFrom, setDateFrom] = useState(urlParams.get("dateFrom") || "");
  const [dateTo, setDateTo] = useState(urlParams.get("dateTo") || "");

  useEffect(() => {
    function handleFilter(e: Event) {
      const d = (e as CustomEvent).detail;
      setDateFrom(d.dateFrom);
      setDateTo(d.dateTo);
    }
    window.addEventListener("datefilter", handleFilter);
    return () => window.removeEventListener("datefilter", handleFilter);
  }, []);

  const params = {
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {}),
  };

  const { data, isLoading, error } = useCeoDashboard(
    Object.keys(params).length > 0 ? params : undefined
  );
  const { data: portfolio } = usePortfolio();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-48" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
        <AlertTriangle size={24} className="text-red-400 mx-auto mb-2" />
        <p className="text-sm text-red-600">Error al cargar datos financieros</p>
      </div>
    );
  }

  const { health, invoicePipeline } = data;

  return (
    <div className="space-y-4">
      {/* At Risk Projects */}
      {health.atRiskProjects.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle size={14} className="text-red-400" />
              Proyectos en Riesgo ({health.atRiskProjects.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Proyecto</th>
                  <th className="text-center px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Salud</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Consumo</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Progreso</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Desviacion</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {health.atRiskProjects.map((p) => (
                  <tr key={p.id} className={`border-b border-gray-50 ${p.healthStatus === "CRITICAL" ? "bg-red-50/50" : "bg-amber-50/30"}`}>
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-gray-900">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.code}</p>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <StatusBadge status={p.healthStatus as HealthStatus} size="sm" />
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium text-red-600">
                      {parseFloat(p.consumptionPercent).toFixed(0)}%
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium text-gray-700">
                      {parseFloat(p.progressPercent).toFixed(0)}%
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-red-600">
                      {parseFloat(p.deviation).toFixed(0)}%
                    </td>
                    <td className="px-4 py-2.5">
                      <a href={`/projects/${p.id}`} className="text-primary text-xs hover:underline">
                        Ver
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Pipeline */}
      {invoicePipeline.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <FileText size={14} className="text-slate-400" />
              Pipeline de Facturacion
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Proyecto</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Etapa</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Monto</th>
                  <th className="text-center px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Estado</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {invoicePipeline.map((inv) => (
                  <tr key={`${inv.projectId}-${inv.sortOrder}`} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-2.5">
                      <a href={`/projects/${inv.projectId}`} className="font-medium text-gray-900 hover:text-primary">
                        {inv.projectName}
                      </a>
                    </td>
                    <td className="px-4 py-2.5 text-gray-700">
                      S{inv.sortOrder} - {inv.phaseName}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium text-gray-900">
                      {formatMoneyFull(parseFloat(inv.invoiceAmount))}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        inv.isPaid
                          ? "bg-[#00e7ba]/20 text-[#021b33]"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {inv.isPaid ? "COBRADO" : "PENDIENTE"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-gray-500 text-xs">
                      {inv.invoiceDate || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Portfolio Table */}
      {portfolio && portfolio.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Portafolio Completo</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Proyecto</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Cliente</th>
                  <th className="text-center px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Estado</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Presupuesto</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Consumido</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Progreso</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {portfolio.map((p) => (
                  <tr key={p.id} className={`border-b border-gray-50 hover:bg-gray-50 ${
                    p.currentHealthStatus === "CRITICAL" ? "bg-red-50/30" : ""
                  }`}>
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-gray-900">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.code}</p>
                    </td>
                    <td className="px-4 py-2.5 text-gray-700">{p.clientName}</td>
                    <td className="px-4 py-2.5 text-center">
                      <StatusBadge status={p.currentHealthStatus} size="sm" />
                    </td>
                    <td className="px-4 py-2.5 text-right text-gray-700">{parseFloat(p.budgetHours).toFixed(0)}h</td>
                    <td className="px-4 py-2.5 text-right text-gray-700">
                      {parseFloat(p.consumedHours).toFixed(0)}h
                      <span className="text-xs text-slate-400 ml-1">({parseFloat(p.consumptionPercent).toFixed(0)}%)</span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-gray-700">{parseFloat(p.progressPercent).toFixed(0)}%</td>
                    <td className="px-4 py-2.5">
                      <a href={`/projects/${p.id}`} className="text-primary text-xs hover:underline">Detalle</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AnalisisFinancieroDashboard() {
  return (
    <QueryProvider>
      <AnalisisFinancieroInner />
    </QueryProvider>
  );
}

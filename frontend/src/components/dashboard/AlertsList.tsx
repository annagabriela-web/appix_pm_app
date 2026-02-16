import { useState } from "react";
import { Check } from "lucide-react";

import { useAlerts, useMarkAlertRead } from "@hooks/useAlerts";

import QueryProvider from "@components/providers/QueryProvider";

import StatusBadge from "./StatusBadge";

function AlertsListInner() {
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const { data, isLoading } = useAlerts(showUnreadOnly || undefined);
  const markRead = useMarkAlertRead();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        Cargando alertas...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowUnreadOnly(false)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            !showUnreadOnly
              ? "bg-primary text-white"
              : "bg-gray-100 text-neutral hover:bg-gray-200"
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setShowUnreadOnly(true)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            showUnreadOnly
              ? "bg-primary text-white"
              : "bg-gray-100 text-neutral hover:bg-gray-200"
          }`}
        >
          Sin leer
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200">
        {!data?.results.length ? (
          <div className="p-8 text-center text-neutral">
            No hay alertas para mostrar
          </div>
        ) : (
          <ul>
            {data.results.map((alert) => (
              <li
                key={alert.id}
                className={`flex items-start gap-4 p-4 border-b border-gray-50 last:border-0 ${
                  !alert.isRead ? "bg-gray-50/50" : ""
                }`}
              >
                <StatusBadge
                  status={alert.alertType === "CRITICAL" ? "CRITICAL" : "WARNING"}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <a
                      href={`/projects/${alert.project}`}
                      className="text-sm font-medium text-gray-900 hover:text-primary"
                    >
                      {alert.projectCode} - {alert.projectName}
                    </a>
                    {!alert.isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-neutral mt-0.5">
                    {alert.message}
                  </p>
                  <p className="text-xs text-neutral mt-1">
                    {new Date(alert.createdAt).toLocaleString("es")}
                  </p>
                </div>
                {!alert.isRead && (
                  <button
                    onClick={() => markRead.mutate(alert.id)}
                    className="flex-shrink-0 p-1.5 text-neutral hover:text-primary transition-colors"
                    aria-label="Marcar como leida"
                  >
                    <Check size={16} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function AlertsList() {
  return (
    <QueryProvider>
      <AlertsListInner />
    </QueryProvider>
  );
}

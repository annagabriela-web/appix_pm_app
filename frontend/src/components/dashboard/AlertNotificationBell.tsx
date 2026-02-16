import { Bell } from "lucide-react";
import { useState } from "react";

import { useAlerts, useMarkAlertRead } from "@hooks/useAlerts";

import QueryProvider from "@components/providers/QueryProvider";

function AlertBellInner() {
  const [isOpen, setIsOpen] = useState(false);
  const { data } = useAlerts(true);
  const markRead = useMarkAlertRead();

  const unreadCount = data?.results.length ?? 0;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label={`Alertas: ${unreadCount} sin leer`}
      >
        <Bell size={20} className="text-neutral" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-critical text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-auto">
          <div className="p-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">
              Alertas ({unreadCount})
            </h3>
          </div>

          {data?.results.length === 0 ? (
            <div className="p-4 text-sm text-neutral text-center">
              Sin alertas pendientes
            </div>
          ) : (
            <ul>
              {data?.results.map((alert) => (
                <li
                  key={alert.id}
                  className="p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        alert.alertType === "CRITICAL"
                          ? "bg-critical"
                          : "bg-warning"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900">
                        {alert.projectCode}
                      </p>
                      <p className="text-xs text-neutral mt-0.5 line-clamp-2">
                        {alert.message}
                      </p>
                    </div>
                    <button
                      onClick={() => markRead.mutate(alert.id)}
                      className="text-xs text-primary hover:underline flex-shrink-0"
                    >
                      Leida
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="p-2 border-t border-gray-100">
            <a
              href="/alerts"
              className="block text-center text-xs text-primary hover:underline py-1"
            >
              Ver todas las alertas
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AlertNotificationBell() {
  return (
    <QueryProvider>
      <AlertBellInner />
    </QueryProvider>
  );
}

import { BarChart3, Table } from "lucide-react";

interface TableViewToggleProps {
  isTableView: boolean;
  onToggle: () => void;
}

export default function TableViewToggle({
  isTableView,
  onToggle,
}: TableViewToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={isTableView}
      aria-label={isTableView ? "Cambiar a vista de grafico" : "Cambiar a vista de tabla"}
      onClick={onToggle}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-neutral border border-gray-200 hover:bg-gray-50 transition-colors"
    >
      {isTableView ? (
        <>
          <BarChart3 size={14} />
          Grafico
        </>
      ) : (
        <>
          <Table size={14} />
          Tabla
        </>
      )}
    </button>
  );
}

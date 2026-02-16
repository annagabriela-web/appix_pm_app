import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";

import {
  useBillingRoles,
  useCreateBillingRole,
  useDeleteBillingRole,
  useUpdateBillingRole,
} from "@hooks/useBillingRoles";
import { formatCurrency } from "@services/formatters";

import QueryProvider from "@components/providers/QueryProvider";

function BillingRolesInner() {
  const { data, isLoading } = useBillingRoles();
  const createMutation = useCreateBillingRole();
  const updateMutation = useUpdateBillingRole();
  const deleteMutation = useDeleteBillingRole();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formName, setFormName] = useState("");
  const [formRate, setFormRate] = useState("");

  const handleCreate = () => {
    if (!formName || !formRate) return;
    createMutation.mutate(
      { roleName: formName, defaultHourlyRate: formRate },
      {
        onSuccess: () => {
          setIsAdding(false);
          setFormName("");
          setFormRate("");
        },
      }
    );
  };

  const handleUpdate = (id: number) => {
    if (!formName || !formRate) return;
    updateMutation.mutate(
      { id, data: { roleName: formName, defaultHourlyRate: formRate } },
      {
        onSuccess: () => {
          setEditingId(null);
          setFormName("");
          setFormRate("");
        },
      }
    );
  };

  const startEdit = (id: number, name: string, rate: string) => {
    setEditingId(id);
    setFormName(name);
    setFormRate(rate);
    setIsAdding(false);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        Cargando tarifas...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Tarifas por Rol
        </h3>
        <button
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
            setFormName("");
            setFormRate("");
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus size={14} />
          Agregar Rol
        </button>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left px-4 py-3 text-xs font-semibold text-neutral uppercase tracking-wide">
              Rol
            </th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-neutral uppercase tracking-wide">
              Tarifa/Hora
            </th>
            <th className="px-4 py-3 w-24" />
          </tr>
        </thead>
        <tbody>
          {isAdding && (
            <tr className="border-b border-gray-100 bg-primary/5">
              <td className="px-4 py-2">
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Nombre del rol"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </td>
              <td className="px-4 py-2">
                <input
                  type="number"
                  step="0.01"
                  value={formRate}
                  onChange={(e) => setFormRate(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-right financial-number focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </td>
              <td className="px-4 py-2 flex gap-1 justify-end">
                <button
                  onClick={handleCreate}
                  className="px-2 py-1 bg-primary text-white text-xs rounded hover:bg-primary/90"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setIsAdding(false)}
                  className="p-1 text-neutral hover:text-gray-900"
                >
                  <X size={14} />
                </button>
              </td>
            </tr>
          )}
          {data?.results.map((role) => (
            <tr
              key={role.id}
              className="border-b border-gray-50 hover:bg-gray-50"
            >
              {editingId === role.id ? (
                <>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      step="0.01"
                      value={formRate}
                      onChange={(e) => setFormRate(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-right financial-number focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </td>
                  <td className="px-4 py-2 flex gap-1 justify-end">
                    <button
                      onClick={() => handleUpdate(role.id)}
                      className="px-2 py-1 bg-primary text-white text-xs rounded hover:bg-primary/90"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1 text-neutral hover:text-gray-900"
                    >
                      <X size={14} />
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td className="px-4 py-3 text-gray-900 font-medium">
                    {role.roleName}
                  </td>
                  <td className="px-4 py-3 text-right financial-number text-gray-900">
                    {formatCurrency(role.defaultHourlyRate)}/hr
                  </td>
                  <td className="px-4 py-3 flex gap-1 justify-end">
                    <button
                      onClick={() =>
                        startEdit(role.id, role.roleName, role.defaultHourlyRate)
                      }
                      className="p-1.5 text-neutral hover:text-primary transition-colors"
                      aria-label={`Editar ${role.roleName}`}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Eliminar rol "${role.roleName}"?`)) {
                          deleteMutation.mutate(role.id);
                        }
                      }}
                      className="p-1.5 text-neutral hover:text-critical transition-colors"
                      aria-label={`Eliminar ${role.roleName}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function BillingRolesManager() {
  return (
    <QueryProvider>
      <BillingRolesInner />
    </QueryProvider>
  );
}

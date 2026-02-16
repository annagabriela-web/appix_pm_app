interface Column {
  key: string;
  label: string;
}

interface AccessibleDataTableProps {
  columns: Column[];
  data: Record<string, string>[];
  caption?: string;
}

export default function AccessibleDataTable({
  columns,
  data,
  caption,
}: AccessibleDataTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        {caption && (
          <caption className="text-left text-xs text-neutral mb-2">
            {caption}
          </caption>
        )}
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className="text-left px-3 py-2 text-xs font-semibold text-neutral uppercase tracking-wide"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="px-3 py-2 text-gray-900 financial-number"
                >
                  {row[col.key] ?? "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

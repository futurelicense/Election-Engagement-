import React from 'react';
interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  width?: string;
}
interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
}
export function Table<T extends {
  id: string;
}>({
  data,
  columns,
  onRowClick
}: TableProps<T>) {
  return <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-200">
            {columns.map(column => <th key={column.key as string} className="px-4 py-3 text-left text-sm font-semibold text-gray-700" style={{
            width: column.width
          }}>
                {column.header}
              </th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => <tr key={item.id} onClick={() => onRowClick?.(item)} className={`border-b border-gray-100 transition-colors ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''} animate-fade-in`} style={{
          animationDelay: `${index * 50}ms`
        }}>
              {columns.map(column => <td key={column.key as string} className="px-4 py-4 text-sm text-gray-900">
                  {column.render ? column.render(item) : String(item[column.key as keyof T] || '-')}
                </td>)}
            </tr>)}
        </tbody>
      </table>
      {data.length === 0 && <div className="text-center py-12 text-gray-500">
          <p>No data available</p>
        </div>}
    </div>;
}
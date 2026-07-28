import React from 'react';

export const Table = ({ columns, data, emptyMessage = 'No records found' }) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-800 glass-card">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
            {columns.map((col, idx) => (
              <th key={idx} className="py-3.5 px-4 font-semibold uppercase text-xs tracking-wider">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-slate-300">
          {data && data.length > 0 ? (
            data.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-slate-800/40 transition duration-150">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="py-3.5 px-4">
                    {col.cell ? col.cell(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center py-10 text-slate-500 font-medium">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

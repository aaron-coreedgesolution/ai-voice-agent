import React from "react";

interface TableProps {
  headers: string[];
  children: React.ReactNode;
}

const Table: React.FC<TableProps> = ({ headers, children }) => (
  <div className="overflow-x-auto bg-white rounded-2xl shadow-md border border-gray-200">
    <table className="min-w-full text-left border-collapse">
      <thead className="bg-gray-100 text-gray-700 uppercase text-sm tracking-wide">
        <tr>
          {headers.map((header) => (
            <th key={header} className="p-3 font-semibold">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

export default Table;

"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
}

interface TableInfo {
  tableName: string;
  columns: ColumnInfo[];
  sampleRows: Record<string, unknown>[];
}

interface SchemaViewerProps {
  schemaInfo: TableInfo[];
}

function TableItem({ table }: { table: TableInfo }) {
  const [open, setOpen] = useState(true);
  const [showSample, setShowSample] = useState(false);

  return (
    <div className="border border-[#30363d] rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-2 px-3 py-2.5 bg-[#21262d] hover:bg-[#2d333b] transition-colors text-left cursor-pointer"
      >
        {open ? <ChevronDown className="h-3.5 w-3.5 text-[#8b949e] shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 text-[#8b949e] shrink-0" />}
        <Table2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
        <span className="text-sm font-mono font-medium text-[#e6edf3]">{table.tableName}</span>
        <span className="ml-auto text-xs text-[#484f58]">{table.columns.length} cols</span>
      </button>

      {open && (
        <div className="divide-y divide-[#21262d]">
          {table.columns.map((col) => (
            <div key={col.column_name} className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#1c2230]/50">
              <span className="font-mono text-xs text-[#e6edf3] min-w-0 flex-1">{col.column_name}</span>
              <span className="font-mono text-xs text-[#8b949e] shrink-0">{col.data_type}</span>
              {col.is_nullable === "YES" && <span className="text-xs text-[#484f58]">null</span>}
            </div>
          ))}

          {table.sampleRows.length > 0 && (
            <div>
              <button
                onClick={() => setShowSample((p) => !p)}
                className="w-full text-left px-3 py-1.5 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-[#1c2230]/50 transition-colors cursor-pointer"
              >
                {showSample ? "Hide" : "Show"} sample data ({table.sampleRows.length} rows)
              </button>

              {showSample && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-[#21262d]">
                        {table.columns.map((col) => (
                          <th
                            key={col.column_name}
                            className="px-2 py-1.5 text-left font-mono text-[#8b949e] font-medium whitespace-nowrap border-r border-[#30363d] last:border-r-0"
                          >
                            {col.column_name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.sampleRows.map((row, i) => (
                        <tr
                          key={i}
                          className={cn("border-t border-[#21262d]", i % 2 === 0 ? "bg-transparent" : "bg-[#161b22]/50")}
                        >
                          {table.columns.map((col) => (
                            <td
                              key={col.column_name}
                              className="px-2 py-1.5 font-mono text-[#e6edf3] whitespace-nowrap border-r border-[#21262d] last:border-r-0 max-w-30 truncate"
                            >
                              {row[col.column_name] === null ? (
                                <span className="text-[#484f58]">null</span>
                              ) : (
                                String(row[col.column_name])
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function SchemaViewer({ schemaInfo }: SchemaViewerProps) {
  if (!schemaInfo || schemaInfo.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-[#484f58] text-sm">
        No schema information available.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {schemaInfo.map((table) => (
        <TableItem key={table.tableName} table={table} />
      ))}
    </div>
  );
}
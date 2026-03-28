"use client";

import { CheckCircle2, XCircle, Clock, Rows3, AlertCircle, Trophy, Info } from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";
import type { ValidationInfo } from "@/hooks/useExecuteQuery";

interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  executionTimeMs: number;
}

interface QueryError {
  message: string;
  detail?: string;
  hint?: string;
}

interface ResultsPanelProps {
  result: QueryResult | null;
  error: QueryError | null;
  validation: ValidationInfo | null;
  isLoading: boolean;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
      <div className="h-12 w-12 rounded-full bg-[#21262d] flex items-center justify-center">
        <Rows3 className="h-5 w-5 text-[#484f58]" />
      </div>
      <div>
        <p className="text-[#8b949e] text-sm font-medium">No results yet</p>
        <p className="text-[#484f58] text-xs mt-1">
          Write a SQL query and press{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-[#30363d] font-mono text-xs">⌘ Enter</kbd> to run it
        </p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
      <p className="text-[#8b949e] text-sm">Executing query…</p>
    </div>
  );
}

export function ResultsPanel({ result, error, validation, isLoading }: ResultsPanelProps) {
  if (isLoading) return <LoadingState />;
  if (!result && !error) return <EmptyState />;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-2 border-b border-[#30363d] bg-[#161b22] shrink-0">
        {error ? (
          <>
            <XCircle className="h-4 w-4 text-red-400 shrink-0" />
            <span className="text-red-400 text-xs font-medium">Query failed</span>
          </>
        ) : result ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="text-emerald-400 text-xs font-medium">
              {result.rowCount} {result.rowCount === 1 ? "row" : "rows"} returned
            </span>
            <span className="text-[#484f58] text-xs ml-auto flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(result.executionTimeMs)}
            </span>
          </>
        ) : null}
      </div>

      {validation && (
        <div
          className={cn(
            "flex items-start gap-3 px-4 py-3 border-b text-sm animate-fade-in shrink-0",
            validation.isCorrect ? "bg-emerald-900/20 border-emerald-700/30" : "bg-amber-900/15 border-amber-700/20"
          )}
        >
          {validation.isCorrect ? (
            <Trophy className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "font-medium text-xs",
                validation.isCorrect ? "text-emerald-300" : "text-amber-300"
              )}
            >
              {validation.isCorrect ? "✓ Correct answer!" : "Not quite right"}
            </p>
            <p className="text-xs text-[#8b949e] mt-0.5">{validation.feedback}</p>

            {!validation.isCorrect &&
              validation.expectedColumns &&
              validation.studentColumns &&
              JSON.stringify(validation.expectedColumns) !== JSON.stringify(validation.studentColumns) && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-[#484f58]">
                    Expected columns:{" "}
                    <span className="font-mono text-emerald-400/70">{validation.expectedColumns.join(", ")}</span>
                  </p>
                  <p className="text-xs text-[#484f58]">
                    Your columns:{" "}
                    <span className="font-mono text-amber-400/70">{validation.studentColumns.join(", ")}</span>
                  </p>
                </div>
              )}
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 space-y-2 animate-fade-in overflow-auto">
          <div className="rounded-lg bg-red-900/20 border border-red-800/40 p-4">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1 min-w-0">
                <p className="text-red-300 text-sm font-medium">SQL Error</p>
                <p className="text-red-400/80 text-xs font-mono wrap-break-word">{error.message}</p>
                {error.detail && (
                  <p className="text-[#8b949e] text-xs">
                    <span className="font-medium">Detail:</span> {error.detail}
                  </p>
                )}
                {error.hint && (
                  <p className="text-[#8b949e] text-xs">
                    <span className="font-medium">Hint:</span> {error.hint}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {result && result.columns.length > 0 && (
        <div className="flex-1 overflow-auto animate-fade-in">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#21262d]">
                {result.columns.map((col, i) => (
                  <th
                    key={i}
                    className="px-3 py-2.5 text-left text-xs font-mono font-semibold text-[#8b949e] whitespace-nowrap border-b border-[#30363d] border-r last:border-r-0"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className={cn(
                    "border-b border-[#21262d] hover:bg-[#21262d]/50 transition-colors",
                    rowIdx % 2 === 1 && "bg-[#161b22]/30"
                  )}
                >
                  {result.columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className="px-3 py-2 font-mono text-xs text-[#e6edf3] whitespace-nowrap border-r border-[#21262d] last:border-r-0 max-w-50 truncate"
                      title={row[col] === null ? "null" : String(row[col])}
                    >
                      {row[col] === null ? (
                        <span className="text-[#484f58] italic">null</span>
                      ) : typeof row[col] === "number" ? (
                        <span className="text-sky-300">{String(row[col])}</span>
                      ) : (
                        String(row[col])
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {result.rowCount > result.rows.length && (
            <div className="px-4 py-2 text-xs text-[#484f58] border-t border-[#30363d] bg-[#161b22]">
              Showing first {result.rows.length} of {result.rowCount} rows
            </div>
          )}
        </div>
      )}

      {result && result.columns.length === 0 && (
        <div className="flex items-center justify-center flex-1 text-[#8b949e] text-sm">
          Query returned no columns.
        </div>
      )}
    </div>
  );
}
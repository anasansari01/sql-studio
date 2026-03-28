"use client";

import { BarChart2, Lightbulb } from "lucide-react";
import TabButtons from "./tabButton";
import { ResultsPanel } from "./resultPanel";
import { SqlEditor } from "./sqlEditor";
import { HintPanel } from "./hintPanel";
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

type BottomTab = "results" | "hint";

const BOTTOM_TABS = [
  { id: "results" as const, icon: BarChart2, label: "Results" },
  { id: "hint" as const, icon: Lightbulb, label: "Hint" },
];

interface EditorPanelProps {
  query: string;
  setQuery: (q: string) => void;
  tableNames: string[];
  onRun: () => void;
  onGetHint: () => void;
  queryLoading: boolean;
  hintLoading: boolean;
  bottomTab: BottomTab;
  setBottomTab: (t: BottomTab) => void;
  result: QueryResult | null;
  error: QueryError | null;
  validation: ValidationInfo | null;
  hint: string | null;
}

export function EditorPanel({
  query,
  setQuery,
  tableNames,
  onRun,
  onGetHint,
  queryLoading,
  hintLoading,
  bottomTab,
  setBottomTab,
  result,
  error,
  validation,
  hint,
}: EditorPanelProps) {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex flex-col border-b border-[#30363d]" style={{ height: "55%" }}>
        <div className="flex items-center gap-2 px-4 py-2 border-b border-[#30363d] bg-[#161b22] shrink-0">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
          <span className="text-xs text-[#484f58] ml-2 font-mono">query.sql</span>
        </div>

        <div className="flex-1 overflow-hidden">
          <SqlEditor
            value={query}
            onChange={setQuery}
            onRun={onRun}
            disabled={queryLoading}
            tableNames={tableNames}
          />
        </div>
      </div>

      <TabButtons tabs={BOTTOM_TABS} activeTab={bottomTab} onChange={setBottomTab} />

      <div className="flex-1 overflow-hidden">
        {bottomTab === "results" && (
          <ResultsPanel result={result} error={error} validation={validation} isLoading={queryLoading} />
        )}
        {bottomTab === "hint" && (
          <HintPanel
            hint={hint}
            isLoading={hintLoading}
            onGetHint={onGetHint}
            hasQuery={query.trim().length > 10}
          />
        )}
      </div>
    </div>
  );
}

export default EditorPanel;
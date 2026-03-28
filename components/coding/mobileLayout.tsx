"use client";

import { BarChart2, BookOpen, ChevronLeft, Database, Lightbulb, PlayIcon, RotateCcw, Trophy } from "lucide-react";
import Link from "next/link";
import { DifficultyBadge } from "../difficultyBadge";
import { useState } from "react";
import QuestionPanel from "./questionPanel";
import { SchemaViewer } from "./schemaViewer";
import { SqlEditor } from "./sqlEditor";
import { ResultsPanel } from "./resultPanel";
import { HintPanel } from "./hintPanel";
import { cn } from "@/lib/utils";
import { useExecuteQuery, ValidationInfo } from "@/hooks/useExecuteQuery";

interface TableInfo {
  tableName: string;
  columns: { column_name: string; data_type: string; is_nullable: string }[];
  sampleRows: Record<string, unknown>[];
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  sandboxSchema: string;
  tables: unknown;
  expectedColumns: string | null;
}

type MobileTab = "problem" | "schema" | "editor" | "results" | "hint";

interface MobileLayoutProps {
  assignment: Assignment;
  schemaInfo: TableInfo[];
  tableNames: string[];
  query: string;
  setQuery: (q: string) => void;
  result: ReturnType<typeof useExecuteQuery>["result"];
  error: ReturnType<typeof useExecuteQuery>["error"];
  validation: ValidationInfo | null;
  queryLoading: boolean;
  hint: string | null;
  hintLoading: boolean;
  solved: boolean;
  onRun: () => void;
  onGetHint: () => void;
  onReset: () => void;
}

export function MobileLayout({
  assignment,
  schemaInfo,
  tableNames,
  query,
  setQuery,
  result,
  error,
  validation,
  queryLoading,
  hint,
  hintLoading,
  solved,
  onRun,
  onGetHint,
  onReset,
}: MobileLayoutProps) {
  const [mobileTab, setMobileTab] = useState<MobileTab>("problem");

  const tabs = [
    { id: "problem" as const, icon: BookOpen, label: "Problem" },
    { id: "schema" as const, icon: Database, label: "Schema" },
    { id: "editor" as const, icon: PlayIcon, label: "Editor" },
    { id: "results" as const, icon: BarChart2, label: "Results" },
    { id: "hint" as const, icon: Lightbulb, label: "Hint" },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {solved && (
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-900/30 border-b border-emerald-700/40 text-xs text-emerald-300 shrink-0">
          <Trophy className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span className="flex-1">🎉 Correct! Assignment solved.</span>
          <Link href="/dashboard" className="text-emerald-400 underline underline-offset-2">
            Dashboard
          </Link>
        </div>
      )}

      <div className="flex items-center justify-between px-3 py-2 border-b border-[#30363d] bg-[#161b22] shrink-0">
        <Link href="/assignments" className="text-[#8b949e] hover:text-[#e6edf3]">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <span className="text-xs font-medium text-[#e6edf3] truncate max-w-45">{assignment.title}</span>
        <DifficultyBadge difficulty={assignment.difficulty} />
      </div>

      <div className="flex border-b border-[#30363d] bg-[#161b22] shrink-0 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMobileTab(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2.5 text-xs whitespace-nowrap rounded-none cursor-pointer shrink-0 font-medium",
              mobileTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}

            {tab.id === "results" && validation && !queryLoading && (
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full ml-1",
                  validation.isCorrect ? "bg-emerald-400" : "bg-amber-400"
                )}
              />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        {mobileTab === "problem" && (
          <div className="h-full overflow-y-auto p-4">
            <QuestionPanel assignment={assignment} />
          </div>
        )}

        {mobileTab === "schema" && (
          <div className="h-full overflow-y-auto p-4">
            <SchemaViewer schemaInfo={schemaInfo} />
          </div>
        )}

        {mobileTab === "editor" && (
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#161b22] border-b border-[#30363d] shrink-0">
              <button onClick={onReset} className="btn-ghost text-xs p-1.5">
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <span className="text-xs text-[#484f58] font-mono flex-1">query.sql</span>
              <button
                onClick={onGetHint}
                disabled={hintLoading}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-amber-900/30 border border-amber-700/40 text-amber-400 disabled:opacity-50"
              >
                <Lightbulb className="h-3.5 w-3.5" />
                Hint
              </button>
              <button
                onClick={onRun}
                disabled={queryLoading}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold disabled:opacity-50"
              >
                <PlayIcon className="h-3.5 w-3.5 fill-current" />
                {queryLoading ? "Running…" : "Run"}
              </button>
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
        )}

        {mobileTab === "results" && (
          <ResultsPanel result={result} error={error} validation={validation} isLoading={queryLoading} />
        )}

        {mobileTab === "hint" && (
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

export default MobileLayout;
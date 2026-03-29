"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Play,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  Copy,
  Check,
  Trophy,
  X,
  BarChart2,
  Lightbulb,
} from "lucide-react";
import { SqlEditor } from "@/components/coding/sqlEditor";
import { ResultsPanel } from "@/components/coding/resultPanel";
import { HintPanel } from "@/components/coding/hintPanel";
import { DifficultyBadge } from "@/components/difficultyBadge";
import { useExecuteQuery } from "@/hooks/useExecuteQuery";
import { useHint } from "@/hooks/useHint";
import { useMobile } from "@/hooks/useMobile";
import TabButtons from "./tabButton";
import MobileLayout from "./mobileLayout";
import LeftPanel from "./leftPanel";

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

interface Props {
  assignment: Assignment;
  schemaInfo: TableInfo[];
}

type BottomTab = "results" | "hint";
type LeftTab = "question" | "schema";

const BOTTOM_TABS = [
  { id: "results" as const, icon: BarChart2, label: "Results" },
  { id: "hint" as const, icon: Lightbulb, label: "Hint" },
];

const DEFAULT_QUERY = "-- Write your SQL query here\n-- Press Ctrl+Enter (or Cmd+Enter) to run\n\nSELECT ";

export function AttemptClient({ assignment, schemaInfo }: Props) {
  const isMobile = useMobile();
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [leftTab, setLeftTab] = useState<LeftTab>("question");
  const [bottomTab, setBottomTab] = useState<BottomTab>("results");
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const {
    result,
    error,
    validation,
    isLoading: queryLoading,
    execute,
    reset,
    solved,
  } = useExecuteQuery();

  const { hint, isLoading: hintLoading, getHint, clearHint } = useHint();

  const tableNames = (assignment.tables as string[]) ?? [];

  const handleRun = useCallback(async () => {
    setBannerDismissed(false);
    await execute(assignment.id, query);
    setBottomTab("results");
  }, [assignment.id, query, execute]);

  const handleGetHint = useCallback(() => {
    getHint(assignment.id, query.trim() === DEFAULT_QUERY.trim() ? "" : query);
    setBottomTab("hint");
  }, [assignment.id, query, getHint]);

  const handleReset = () => {
    setQuery(DEFAULT_QUERY);
    reset();
    clearHint();
    setBannerDismissed(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showBanner = solved && !bannerDismissed;

  if (isMobile) {
    return (
      <MobileLayout
        assignment={assignment}
        schemaInfo={schemaInfo}
        tableNames={tableNames}
        query={query}
        setQuery={setQuery}
        result={result}
        error={error}
        validation={validation}
        queryLoading={queryLoading}
        hint={hint}
        hintLoading={hintLoading}
        solved={solved}
        onRun={handleRun}
        onGetHint={handleGetHint}
        onReset={handleReset}
      />
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#0f1117]">
      {showBanner && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-emerald-900/30 border-b border-emerald-700/40 animate-fade-in shrink-0">
          <Trophy className="h-4 w-4 text-amber-400 shrink-0" />
          <p className="text-sm text-emerald-300 font-medium flex-1">
            🎉 Correct! Your solution has been saved to your dashboard.
          </p>
          <Link
            href="/dashboard"
            className="text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-2 shrink-0"
          >
            View dashboard
          </Link>
          <button
            onClick={() => setBannerDismissed(true)}
            className="text-[#484f58] hover:text-[#8b949e] transition-colors ml-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-3 px-4 h-12 border-b border-[#30363d] bg-[#161b22] shrink-0">
        <Link
          href="/assignments"
          className="flex items-center gap-1.5 text-xs text-[#8b949e] hover:text-[#e6edf3] transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Assignments
        </Link>

        <div className="w-px h-4 bg-[#30363d]" />

        <button
          onClick={() => setLeftPanelOpen((p) => !p)}
          className="btn-ghost text-xs p-1.5 cursor-pointer rounded-md text-[#8b949e] hover:text-[#e6edf3] transition-colors  shrink-0"
          title={leftPanelOpen ? "Hide panel" : "Show panel"}
        >
          {leftPanelOpen ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeftOpen className="h-4 w-4" />
          )}
        </button>

        <span className="text-[#8b949e] text-sm font-medium truncate hidden md:block">
          {assignment.title}
        </span>

        <DifficultyBadge difficulty={assignment.difficulty} />

        {solved && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            Solved
          </span>
        )}

        <div className="ml-auto flex items-center gap-4">
          <button onClick={handleCopy} className="btn-ghost text-xs cursor-pointer rounded-md text-[#8b949e] hover:text-[#e6edf3] transition-colors  shrink-0">
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden sm:block text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span className="hidden sm:block">Copy</span>
              </>
            )}
          </button>

          <button onClick={handleReset} className="btn-ghost text-xs cursor-pointer rounded-md text-[#8b949e] hover:text-[#e6edf3] transition-colors  shrink-0">
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:block">Reset</span>
          </button>

          <button
            onClick={handleGetHint}
            disabled={hintLoading}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-amber-900/30 hover:bg-amber-900/50 border border-amber-700/40 text-amber-400 hover:text-amber-300 transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed shrink-0"
          >
            <Lightbulb className="h-3.5 w-3.5" />
            <span className="hidden sm:block">
              {hintLoading ? "Thinking…" : "Hint"}
            </span>
          </button>

          <button
            onClick={handleRun}
            disabled={queryLoading}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            {queryLoading ? "Running…" : "Run"}
            <span className="hidden lg:block text-indigo-300 font-normal">⌘↵</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {leftPanelOpen && (
          LeftPanel({ assignment, schemaInfo, leftTab, setLeftTab })
        )}

        <div className="flex flex-col flex-1 overflow-hidden">
          <div
            className="flex flex-col border-b border-[#30363d]"
            style={{ height: "55%" }}
          >
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
                onRun={handleRun}
                disabled={queryLoading}
                tableNames={tableNames}
              />
            </div>
          </div>

          <div className="flex flex-col flex-1 overflow-hidden bg-[#0f1117]">
            <TabButtons
              tabs={BOTTOM_TABS}
              activeTab={bottomTab}
              onChange={setBottomTab}
              extraContent={
                bottomTab === "results" && result && (
                  <span className="ml-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full px-1.5 py-px">
                    {result.rowCount}
                  </span>
                )
              }
            />
            <div className="flex-1 overflow-hidden">
              {bottomTab === "results" ? (
                <ResultsPanel
                  result={result}
                  error={error}
                  validation={validation}
                  isLoading={queryLoading}
                />
              ) : (
                <HintPanel
                  hint={hint}
                  isLoading={hintLoading}
                  onGetHint={handleGetHint}
                  hasQuery={
                    query.trim() !== DEFAULT_QUERY.trim() &&
                    query.trim().length > 10
                  }
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  AlertTriangle,
} from "lucide-react";
import { DifficultyBadge } from "@/components/difficultyBadge";
import { cn, formatDuration } from "@/lib/utils";

interface RecentAttempt {
  id: string;
  assignmentId: string;
  sqlQuery: string;
  status: "correct" | "wrong" | "error" | "empty";
  rowCount: number;
  errorMessage: string | null;
  executionTimeMs: number | null;
  createdAt: string;
  assignmentTitle: string;
  difficulty: "easy" | "medium" | "hard";
}

interface Props {
  attempt: RecentAttempt;
  compact?: boolean;
}

const STATUS_CONFIG = {
  correct: {
    icon: CheckCircle2,
    color: "text-emerald-400",
    label: "Correct",
    bg: "bg-emerald-900/20",
  },
  wrong: {
    icon: AlertTriangle,
    color: "text-amber-400",
    label: "Wrong answer",
    bg: "bg-amber-900/20",
  },
  error: {
    icon: XCircle,
    color: "text-red-400",
    label: "SQL error",
    bg: "bg-red-900/20",
  },
  empty: {
    icon: MinusCircle,
    color: "text-[#8b949e]",
    label: "No rows returned",
    bg: "bg-[#21262d]",
  },
} as const;

export function AttemptsList({ attempt, compact = false }: Props) {
  const [showQuery, setShowQuery] = useState(false);

  const cfg = STATUS_CONFIG[attempt.status as keyof typeof STATUS_CONFIG];
  if (!cfg) {
    console.error("[AttemptsList] Unknown attempt status:", attempt.status, "for id:", attempt.id);
    return (
      <div className="glass-card p-4 border-red-500/20">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
          <span className="text-xs text-red-400">
            Unknown status &quot;{attempt.status}&quot; — {attempt.assignmentTitle}
          </span>
        </div>
      </div>
    );
  }

  const StatusIcon = cfg.icon;

  return (
    <div
      className={cn(
        "glass-card p-4 hover:border-[#484f58] transition-colors",
        attempt.status === "correct" && "border-emerald-900/40"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("rounded-md p-1 shrink-0 mt-0.5", cfg.bg)}>
          <StatusIcon className={cn("h-3.5 w-3.5", cfg.color)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <Link
                href={`/attempt/${attempt.assignmentId}`}
                className="text-sm font-medium text-[#e6edf3] hover:text-indigo-300 transition-colors truncate"
              >
                {attempt.assignmentTitle}
              </Link>
              <DifficultyBadge difficulty={attempt.difficulty} />
            </div>
            <div className="flex items-center gap-3 shrink-0 text-xs text-[#484f58]">
              {attempt.executionTimeMs != null && (
                <span>{formatDuration(attempt.executionTimeMs)}</span>
              )}
              <span>
                {new Date(attempt.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <span className={cn("text-xs font-medium", cfg.color)}>
              {cfg.label}
            </span>

            {(attempt.status === "correct" || attempt.status === "wrong") && (
              <span className="text-xs text-[#484f58]">
                {attempt.rowCount} {attempt.rowCount === 1 ? "row" : "rows"}
              </span>
            )}

            {attempt.status === "error" && attempt.errorMessage && (
              <span
                className="text-xs text-red-400/70 truncate max-w-60"
                title={attempt.errorMessage}
              >
                {attempt.errorMessage}
              </span>
            )}
          </div>

          {!compact && (
            <>
              <button
                onClick={() => setShowQuery((p) => !p)}
                className="mt-2 text-xs text-[#484f58] hover:text-indigo-400 transition-colors cursor-pointer"
              >
                {showQuery ? "Hide" : "Show"} query
              </button>
              {showQuery && (
                <pre className="mt-2 text-xs font-mono text-[#8b949e] bg-[#0f1117] border border-[#30363d] rounded-lg p-3 overflow-x-auto whitespace-pre-wrap wrap-break-word">
                  {attempt.sqlQuery}
                </pre>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
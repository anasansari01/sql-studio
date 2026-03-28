"use client";

import { Lightbulb, Sparkles, RefreshCw } from "lucide-react";

interface HintPanelProps {
  hint: string | null;
  isLoading: boolean;
  onGetHint: () => void;
  hasQuery: boolean;
}

export function HintPanel({ hint, isLoading, onGetHint, hasQuery }: HintPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#30363d] bg-[#161b22] shrink-0">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-medium text-[#8b949e]">AI Hint</span>
        </div>
        <button
          onClick={onGetHint}
          disabled={isLoading}
          className="flex items-center gap-1.5 rounded-md bg-amber-900/30 hover:bg-amber-900/50 border border-amber-700/40 px-3 py-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              Thinking…
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              {hint ? "Get another hint" : "Get hint"}
            </>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {!hint && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="h-12 w-12 rounded-full bg-amber-900/20 flex items-center justify-center">
              <Lightbulb className="h-5 w-5 text-amber-400/60" />
            </div>
            <div>
              <p className="text-[#8b949e] text-sm font-medium">Need a nudge?</p>
              <p className="text-[#484f58] text-xs mt-1 max-w-50">
                Click "Get hint" for a conceptual clue — no solutions, just guidance.
                {!hasQuery && (
                  <span className="block mt-1 text-amber-600/60">
                    Write a query first for a more targeted hint.
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
            <p className="text-[#8b949e] text-xs">Generating hint…</p>
          </div>
        )}

        {hint && !isLoading && (
          <div className="animate-slide-up space-y-3">
            <div className="rounded-xl bg-amber-900/15 border border-amber-700/30 p-4">
              <div className="flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[#e6edf3] text-sm leading-relaxed">{hint}</p>
              </div>
            </div>
            <p className="text-[#484f58] text-xs text-center">
              This is a hint, not a solution. Work through it yourself!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
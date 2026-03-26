import Link from "next/link";
import { CheckCircle2, ArrowRight, Code2 } from "lucide-react";
import { DifficultyBadge } from "@/components/difficultyBadge";

interface SolvedAssignment {
  id: string;
  assignmentId: string;
  bestQuery: string;
  solvedAt: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  description: string;
}

interface SolvedItemProps {
  item: SolvedAssignment;
  expandedQuery: string | null;
  onToggleExpand: (id: string) => void;
}

export function SolvedItem({ item, expandedQuery, onToggleExpand }: SolvedItemProps) {
  const isExpanded = expandedQuery === item.id;

  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <DifficultyBadge difficulty={item.difficulty} />
            <span className="text-xs text-[#484f58] ml-auto">
              {new Date(item.solvedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <Link
            href={`/attempt/${item.assignmentId}`}
            className="text-sm font-medium text-[#e6edf3] hover:text-indigo-300 transition-colors truncate"
          >
            {item.title}
          </Link>
          <p className="text-[#8b949e] text-xs line-clamp-1">{item.description}</p>

          <div className="mt-3">
            <button
              onClick={() => onToggleExpand(item.id)}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Code2 className="h-3 w-3" />
              {isExpanded ? "Hide" : "Show"} your solution
            </button>
            {isExpanded && (
              <pre className="mt-2 text-xs font-mono text-[#8b949e] bg-[#0f1117] border border-[#30363d] rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
                {item.bestQuery}
              </pre>
            )}
          </div>
        </div>

        <Link
          href={`/attempt/${item.assignmentId}`}
          className="shrink-0 flex items-center gap-1.5 text-xs text-[#8b949e] hover:text-indigo-400 transition-colors"
        >
          Retry
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
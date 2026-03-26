import Link from "next/link";
import { ArrowRight, Table2, Clock } from "lucide-react";
import { DifficultyBadge } from "../difficultyBadge";

interface Assignment {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  tables: unknown;
  createdAt: string;
}

interface Props {
  assignment: Assignment;
  index: number;
}

export function AssignmentCard({ assignment, index }: Props) {
  const tables = (assignment.tables as string[]) ?? [];

  return (
    <Link
      href={`/attempt/${assignment.id}`}
      className="group block glass-card p-5 hover:border-indigo-500/50 hover:bg-[#1e2535] transition-all duration-200 animate-fade-in"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-600/20 text-indigo-400 text-xs font-bold">
              {index + 1}
            </span>
            <DifficultyBadge difficulty={assignment.difficulty} />
          </div>

          <h3 className="text-[#e6edf3] font-semibold text-base mb-1.5 group-hover:text-indigo-300 transition-colors">
            {assignment.title}
          </h3>

          <p className="text-[#8b949e] text-sm leading-relaxed line-clamp-2">
            {assignment.description}
          </p>

          <div className="mt-3 flex items-center gap-4 text-xs text-[#484f58]">
            <span className="flex items-center gap-1.5">
              <Table2 className="h-3.5 w-3.5" />
              {tables.length} {tables.length === 1 ? "table" : "tables"}:{" "}
              {tables.slice(0, 3).join(", ")}
              {tables.length > 3 && "…"}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {new Date(assignment.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-[#21262d] group-hover:bg-indigo-600 group-hover:text-white text-[#484f58] transition-all duration-200">
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}
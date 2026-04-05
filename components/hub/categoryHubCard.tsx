import { CategoryCard } from "@/@types/types";
import { cn } from "@/lib/utils";
import {
  Trophy, Zap, BarChart2, GitMerge, Layers, Code2,
  BookOpen, CheckCircle2, Clock, Target,
  ArrowRight, Search,
} from "lucide-react";import Link from "next/link";

const ICON_MAP: Record<string, React.ElementType> = {
  Trophy, Zap, BarChart2, GitMerge, Layers, Code2, BookOpen,
  Target, Clock, CheckCircle2, Search,
};


const COLOR_CONFIG: Record<
  string,
  {
    card: string;
    iconBg: string;
    iconColor: string;
    badge: string;
    bar: string;
    barBg: string;
    ring: string;
  }
> = {
  indigo: {
    card: "hover:border-indigo-500/50",
    iconBg: "bg-indigo-600/20",
    iconColor: "text-indigo-400",
    badge: "bg-indigo-900/30 text-indigo-300 border-indigo-700/40",
    bar: "bg-indigo-500",
    barBg: "bg-indigo-900/20",
    ring: "border-indigo-500/60",
  },
  amber: {
    card: "hover:border-amber-500/50",
    iconBg: "bg-amber-600/20",
    iconColor: "text-amber-400",
    badge: "bg-amber-900/30 text-amber-300 border-amber-700/40",
    bar: "bg-amber-500",
    barBg: "bg-amber-900/20",
    ring: "border-amber-500/60",
  },
  emerald: {
    card: "hover:border-emerald-500/50",
    iconBg: "bg-emerald-600/20",
    iconColor: "text-emerald-400",
    badge: "bg-emerald-900/30 text-emerald-300 border-emerald-700/40",
    bar: "bg-emerald-500",
    barBg: "bg-emerald-900/20",
    ring: "border-emerald-500/60",
  },
  sky: {
    card: "hover:border-sky-500/50",
    iconBg: "bg-sky-600/20",
    iconColor: "text-sky-400",
    badge: "bg-sky-900/30 text-sky-300 border-sky-700/40",
    bar: "bg-sky-500",
    barBg: "bg-sky-900/20",
    ring: "border-sky-500/60",
  },
  purple: {
    card: "hover:border-purple-500/50",
    iconBg: "bg-purple-600/20",
    iconColor: "text-purple-400",
    badge: "bg-purple-900/30 text-purple-300 border-purple-700/40",
    bar: "bg-purple-500",
    barBg: "bg-purple-900/20",
    ring: "border-purple-500/60",
  },
  rose: {
    card: "hover:border-rose-500/50",
    iconBg: "bg-rose-600/20",
    iconColor: "text-rose-400",
    badge: "bg-rose-900/30 text-rose-300 border-rose-700/40",
    bar: "bg-rose-500",
    barBg: "bg-rose-900/20",
    ring: "border-rose-500/60",
  },
};

const DEFAULT_COLOR = COLOR_CONFIG.indigo;

function CategoryHubCard({ category, index }: { category: CategoryCard; index: number }) {
  const cfg = COLOR_CONFIG[category.color] ?? DEFAULT_COLOR;
  const Icon = ICON_MAP[category.icon] ?? BookOpen;
  const pct = category.totalAssignments > 0
    ? Math.round((category.solvedAssignments / category.totalAssignments) * 100)
    : 0;
  const isCompleted = category.totalAssignments > 0 && category.solvedAssignments >= category.totalAssignments;
  const isInProgress = category.solvedAssignments > 0 && !isCompleted;

  return (
    <Link
      href={`/hub/${category.slug}`}
      className={cn(
        "group glass-card p-5 block transition-all duration-200 animate-fade-in",
        cfg.card,
        isCompleted && `border-emerald-600/40 ${cfg.ring}`,
        isInProgress && cfg.ring
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", cfg.iconBg)}>
            <Icon className={cn("h-5 w-5", cfg.iconColor)} />
          </div>
          <div className="min-w-0">
            <h3 className="text-[#e6edf3] font-semibold text-sm group-hover:text-white transition-colors truncate">
              {category.name}
            </h3>
            <p className="text-[#484f58] text-xs mt-0.5">
              {category.totalAssignments} {category.totalAssignments === 1 ? "problem" : "problems"}
            </p>
          </div>
        </div>

        {isCompleted ? (
          <span className="shrink-0 flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-emerald-900/30 text-emerald-300 border border-emerald-700/40">
            <CheckCircle2 className="h-3 w-3" />
            Done
          </span>
        ) : isInProgress ? (
          <span className={cn("shrink-0 text-[10px] font-semibold px-2 py-1 rounded-full border", cfg.badge)}>
            Active
          </span>
        ) : null}
      </div>

      <p className="text-[#8b949e] text-xs leading-relaxed line-clamp-2 mb-4">
        {category.description}
      </p>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#484f58]">
            {category.solvedAssignments}/{category.totalAssignments} solved
          </span>
          <span className={cn("text-xs font-semibold", isCompleted ? "text-emerald-400" : cfg.iconColor)}>
            {pct}%
          </span>
        </div>

        <div className={cn("h-1.5 rounded-full overflow-hidden", cfg.barBg)}>
          <div
            className={cn("h-full rounded-full transition-all duration-700", isCompleted ? "bg-emerald-500" : cfg.bar)}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#21262d]">
        <span className="text-xs text-[#484f58]">
          {isCompleted ? "Revisit" : isInProgress ? "Continue" : "Start"}
        </span>
        <div className={cn(
          "h-7 w-7 rounded-full flex items-center justify-center transition-all duration-200",
          "bg-[#21262d] text-[#484f58] group-hover:text-white",
          isCompleted ? "group-hover:bg-emerald-600" : `group-hover:${cfg.bar.replace("bg-", "bg-")}`
        )}>
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </Link>
  );
}

export default CategoryHubCard;
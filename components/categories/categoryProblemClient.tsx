"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft, CheckCircle2, Circle, Trophy,
  BookOpen, Search, ArrowRight, Table2,
  Layers, BarChart2, GitMerge, Code2, Zap, Target, Clock,
  Lock,
} from "lucide-react";
import { DifficultyBadge } from "@/components/difficultyBadge";
import { cn } from "@/lib/utils";
import type { CategoryDetail, CategoryProblem } from "@/app/hub/[slug]/page";

const ICON_MAP: Record<string, React.ElementType> = {
  Trophy, Zap, BarChart2, GitMerge, Layers, Code2,
  BookOpen, Target, Clock, CheckCircle2, Search,
};

const COLOR_CONFIG: Record<
  string,
  { iconBg: string; iconColor: string; bar: string; ring: string; badgeBg: string; badgeText: string; badgeBorder: string }
> = {
  indigo:  { iconBg: "bg-indigo-600/20",  iconColor: "text-indigo-400",  bar: "bg-indigo-500",  ring: "ring-indigo-500/30",  badgeBg: "bg-indigo-900/30",  badgeText: "text-indigo-300",  badgeBorder: "border-indigo-700/40" },
  amber:   { iconBg: "bg-amber-600/20",   iconColor: "text-amber-400",   bar: "bg-amber-500",   ring: "ring-amber-500/30",   badgeBg: "bg-amber-900/30",   badgeText: "text-amber-300",   badgeBorder: "border-amber-700/40" },
  emerald: { iconBg: "bg-emerald-600/20", iconColor: "text-emerald-400", bar: "bg-emerald-500", ring: "ring-emerald-500/30", badgeBg: "bg-emerald-900/30", badgeText: "text-emerald-300", badgeBorder: "border-emerald-700/40" },
  sky:     { iconBg: "bg-sky-600/20",     iconColor: "text-sky-400",     bar: "bg-sky-500",     ring: "ring-sky-500/30",     badgeBg: "bg-sky-900/30",     badgeText: "text-sky-300",     badgeBorder: "border-sky-700/40" },
  purple:  { iconBg: "bg-purple-600/20",  iconColor: "text-purple-400",  bar: "bg-purple-500",  ring: "ring-purple-500/30",  badgeBg: "bg-purple-900/30",  badgeText: "text-purple-300",  badgeBorder: "border-purple-700/40" },
  rose:    { iconBg: "bg-rose-600/20",    iconColor: "text-rose-400",    bar: "bg-rose-500",    ring: "ring-rose-500/30",    badgeBg: "bg-rose-900/30",    badgeText: "text-rose-300",    badgeBorder: "border-rose-700/40" },
};

const DEFAULT_COLORS = COLOR_CONFIG.indigo;

type FilterMode = "all" | "solved" | "unsolved";
type SortMode   = "position" | "difficulty-asc" | "difficulty-desc";

const DIFF_ORDER = { easy: 0, medium: 1, hard: 2 } as any;

interface Props {
  category: CategoryDetail;
  problems: CategoryProblem[];
  totalSolved: number;
}

export function CategoryProblemsClient({ category, problems, totalSolved }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [sort, setSort] = useState<SortMode>("position");

  const cfg = COLOR_CONFIG[category.color] ?? DEFAULT_COLORS;
  const Icon = ICON_MAP[category.icon] ?? BookOpen;

  const total = problems.length;
  const pct = total > 0 ? Math.round((totalSolved / total) * 100) : 0;
  const isAllDone = total > 0 && totalSolved >= total;

  const diffStats = (["easy", "medium", "hard"] as const).map((d) => ({
    diff: d,
    total: problems.filter((p) => p.difficulty === d).length,
    solved: problems.filter((p) => p.difficulty === d && p.solved).length,
  }));

  const visible = problems
    .filter((p) => {
      if (search) {
        const q = search.toLowerCase();
        if (!p.title.toLowerCase().includes(q) &&
            !p.description.toLowerCase().includes(q)) return false;
      }
      if (filter === "solved") return p.solved;
      if (filter === "unsolved") return !p.solved;
      return true;
    })
    .sort((a, b) => {
      if (sort === "difficulty-asc") return DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty];
      if (sort === "difficulty-desc") return DIFF_ORDER[b.difficulty] - DIFF_ORDER[a.difficulty];
      return a.position - b.position;
    });

  const diffColors: Record<string, string> = {
    easy: "text-emerald-400",
    medium: "text-amber-400",
    hard: "text-red-400",
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0f1117]">
      <div className="max-w-5xl mx-auto px-4 py-8">

        <nav className="flex items-center gap-2 mb-6 text-xs text-[#484f58]">
          <Link href="/hub" className="hover:text-[#8b949e] transition-colors flex items-center gap-1">
            <Layers className="h-3.5 w-3.5" />Hub
          </Link>
          <span>/</span>
          <span className="text-[#e6edf3]">{category.name}</span>
        </nav>

        <div className="glass-card p-6 mb-6">
          <div className="flex items-start gap-5">
            <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shrink-0", cfg.iconBg)}>
              <Icon className={cn("h-7 w-7", cfg.iconColor)} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                <div>
                  <h1 className="text-2xl font-bold text-[#e6edf3]">{category.name}</h1>
                  <p className="text-[#8b949e] text-sm mt-1">{category.description}</p>
                </div>
                {isAllDone ? (
                  <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-900/30 text-emerald-300 border border-emerald-700/40 shrink-0">
                    <Trophy className="h-3.5 w-3.5 text-amber-400" />
                    All solved!
                  </span>
                ) : totalSolved > 0 ? (
                  <span className={cn(
                    "text-xs font-semibold px-3 py-1.5 rounded-full border shrink-0",
                    cfg.badgeBg, cfg.badgeText, cfg.badgeBorder
                  )}>
                    In progress
                  </span>
                ) : null}
              </div>

              <div className="space-y-1.5 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8b949e]">{totalSolved}/{total} solved</span>
                  <span className={cn("font-semibold", isAllDone ? "text-emerald-400" : cfg.iconColor)}>
                    {pct}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[#21262d] overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700",
                      isAllDone ? "bg-emerald-500" : cfg.bar)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 flex-wrap">
                {diffStats.filter((s) => s.total > 0).map(({ diff, total: dt, solved: ds }) => (
                  <div key={diff} className="flex items-center gap-1.5">
                    <span className={cn("text-xs font-semibold capitalize", diffColors[diff])}>{diff}</span>
                    <span className="text-xs text-[#484f58]">{ds}/{dt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#484f58]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problems…"
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#161b22] border border-[#30363d] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm text-[#e6edf3] placeholder-[#484f58] transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {(["all", "solved", "unsolved"] as FilterMode[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border capitalize",
                  filter === f
                    ? "bg-indigo-600 text-white border-indigo-500"
                    : "bg-[#21262d] text-[#8b949e] border-[#30363d] hover:text-[#e6edf3] hover:border-[#484f58]"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            className="bg-[#21262d] border border-[#30363d] text-[#8b949e] text-xs rounded-lg px-3 py-1.5 outline-none cursor-pointer ml-auto"
          >
            <option value="position">Curriculum order</option>
            <option value="difficulty-asc">Easiest first</option>
            <option value="difficulty-desc">Hardest first</option>
          </select>
        </div>

        {visible.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Search className="h-8 w-8 text-[#484f58] mx-auto mb-3" />
            <p className="text-[#8b949e] font-medium">No problems match your filter</p>
            <p className="text-[#484f58] text-sm mt-1">Try adjusting your search or filter.</p>
            <button
              onClick={() => { setSearch(""); setFilter("all"); }}
              className="mt-4 text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="grid grid-cols-[2.5rem_1fr_auto_auto_auto] items-center gap-3 px-5 py-3 border-b border-[#30363d] bg-[#161b22]">
              <span className="text-xs font-semibold text-[#484f58] uppercase tracking-wider">#</span>
              <span className="text-xs font-semibold text-[#484f58] uppercase tracking-wider">Title</span>
              <span className="text-xs font-semibold text-[#484f58] uppercase tracking-wider hidden sm:block">Tables</span>
              <span className="text-xs font-semibold text-[#484f58] uppercase tracking-wider">Difficulty</span>
              <span className="text-xs font-semibold text-[#484f58] uppercase tracking-wider text-center">Status</span>
            </div>

            <div className="divide-y divide-[#21262d]">
              {visible.map((problem, idx) => (
                <ProblemRow
                  key={problem.id}
                  problem={problem}
                  displayIndex={idx + 1}
                  categorySlug={category.slug}
                />
              ))}
            </div>

            <div className="px-5 py-3 border-t border-[#30363d] bg-[#161b22] flex items-center justify-between">
              <span className="text-xs text-[#484f58]">
                {visible.length} of {total} problem{total !== 1 ? "s" : ""}
              </span>
              <span className="text-xs text-[#484f58]">
                {totalSolved} solved
              </span>
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <Link href="/hub" className="btn-secondary text-sm">
            <ChevronLeft className="h-4 w-4" />
            Back to hub
          </Link>
          <Link href="/assignments" className="btn-ghost text-sm">
            <BookOpen className="h-4 w-4" />
            Browse all problems
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

interface ProblemRowProps {
  problem: CategoryProblem;
  displayIndex: number;
  categorySlug: string;
}

function ProblemRow({ problem, displayIndex, categorySlug }: ProblemRowProps) {
  const href = `/attempt/${problem.id}?from=hub&category=${categorySlug}`;

  return (
    <Link
      href={href}
      className={cn(
        "grid grid-cols-[2.5rem_1fr_auto_auto_auto] items-center gap-3 px-5 py-4 group transition-colors",
        problem.solved ? "hover:bg-emerald-900/10" : "hover:bg-[#1e2535]"
      )}
    >
      <span className={cn(
        "text-sm font-mono",
        problem.solved ? "text-emerald-600" : "text-[#484f58]"
      )}>
        {displayIndex}
      </span>

      <div className="min-w-0">
        <span className={cn(
          "text-sm font-medium transition-colors block truncate",
          problem.solved
            ? "text-emerald-300 group-hover:text-emerald-200"
            : "text-[#e6edf3] group-hover:text-indigo-300"
        )}>
          {problem.title}
        </span>
        <p className="text-xs text-[#484f58] truncate hidden sm:block mt-0.5">
          {problem.description}
        </p>
      </div>

      <div className="hidden sm:flex items-center gap-1 flex-wrap justify-end max-w-37.5">
        {problem.tables.slice(0, 2).map((t:any) => (
          <span
            key={t}
            className="inline-flex items-center gap-0.5 text-[10px] font-mono bg-[#21262d] border border-[#30363d] text-[#484f58] px-1.5 py-0.5 rounded"
          >
            <Table2 className="h-2.5 w-2.5 shrink-0" />
            {t}
          </span>
        ))}
        {problem.tables.length > 2 && (
          <span className="text-[10px] text-[#484f58]">+{problem.tables.length - 2}</span>
        )}
      </div>

      <DifficultyBadge difficulty={problem.difficulty} size="sm" />

      <div className="flex items-center justify-center">
        {problem.solved ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        ) : (
          <Circle className="h-4 w-4 text-[#30363d] group-hover:text-[#484f58] transition-colors" />
        )}
      </div>
    </Link>
  );
}
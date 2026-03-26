"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Zap,
  Target,
  Clock,
  CheckCircle2,
  BookOpen,
  BarChart2,
  Code2,
  Calendar,
} from "lucide-react";
import { DifficultyBadge } from "@/components/difficultyBadge";
import { cn } from "@/lib/utils";
import type { SafeUser } from "@/db/schema";
import { StatCard } from "./statCard";
import { AttemptBreakdownBar } from "./attemptBreakdownBar";
import { SolvedItem } from "./solvedItem";
import { AttemptsList } from "./attemptList";
import { EmptyState } from "./emptyState";
import { Button } from "@/components/ui/button";

export interface SolvedAssignment {
  id: string;
  assignmentId: string;
  bestQuery: string;
  solvedAt: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  description: string;
}

export interface RecentAttempt {
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

export interface DifficultyBreakdown {
  difficulty: "easy" | "medium" | "hard";
  solved: number;
}

export interface TotalPerDifficulty {
  difficulty: "easy" | "medium" | "hard";
  total: number;
}

export interface DashboardStats {
  totalSolved: number;
  totalAttempts: number;
  correctAttempts: number;
  wrongAttempts: number;
  errorAttempts: number;
  successRate: number;
}

export interface DashboardData {
  stats: DashboardStats;
  solved: SolvedAssignment[];
  recentAttempts: RecentAttempt[];
  difficultyBreakdown: DifficultyBreakdown[];
  totalPerDifficulty: TotalPerDifficulty[];
}

export type Tab = "overview" | "solved" | "attempts";

interface Props {
  initialData: DashboardData | null;
  user: SafeUser;
}

export function DashboardClient({ initialData, user }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [expandedQuery, setExpandedQuery] = useState<string | null>(null);

  const data = initialData;
  const stats = data?.stats;

  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const difficultyMap = {
    easy: { solved: 0, total: 0 },
    medium: { solved: 0, total: 0 },
    hard: { solved: 0, total: 0 },
  };
  data?.difficultyBreakdown.forEach((d) => {
    difficultyMap[d.difficulty].solved = Number(d.solved);
  });
  data?.totalPerDifficulty.forEach((d) => {
    difficultyMap[d.difficulty].total = Number(d.total);
  });

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    {
      id: "solved",
      label: `Solved (${stats?.totalSolved ?? 0})`,
      icon: Trophy,
    },
    { id: "attempts", label: "History", icon: Clock },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#e6edf3]">
            Hey, {user.name.split(" ")[0]} 👋
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Calendar className="h-3.5 w-3.5 text-[#484f58]" />
            <p className="text-[#8b949e] text-sm">Member since {joinedDate}</p>
          </div>
        </div>
        <Link
          href="/assignments"
          className="btn-primary text-sm self-start sm:self-auto"
        >
          <BookOpen className="h-4 w-4" />
          Browse assignments
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard
          icon={Trophy}
          label="Problems solved"
          value={stats?.totalSolved ?? 0}
          iconClass="text-amber-400"
          bgClass="bg-amber-900/20"
        />
        <StatCard
          icon={Zap}
          label="Total attempts"
          value={stats?.totalAttempts ?? 0}
          iconClass="text-indigo-400"
          bgClass="bg-indigo-900/20"
        />
        <StatCard
          icon={Target}
          label="Accuracy"
          value={`${stats?.successRate ?? 0}%`}
          iconClass="text-emerald-400"
          bgClass="bg-emerald-900/20"
        />
        <StatCard
          icon={CheckCircle2}
          label="Correct answers"
          value={stats?.correctAttempts ?? 0}
          iconClass="text-sky-400"
          bgClass="bg-sky-900/20"
        />
      </div>

      {stats && stats.totalAttempts > 0 && (
        <AttemptBreakdownBar stats={stats} />
      )}

      <div className="flex border-b border-[#30363d] mb-6 bg-[#0d1117] rounded-t-lg overflow-hidden">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all duration-200 rounded-none cursor-pointer",
                "hover:bg-[#21262d] hover:text-[#e6edf3]",
                isActive 
                  ? "text-[#e6edf3] bg-[#1f2328]" 
                  : "text-[#8b949e] hover:text-[#e6edf3]"
              )}
            >
              <tab.icon className={cn(
                "h-4 w-4 transition-colors",
                isActive ? "text-indigo-400" : "text-[#8b949e] group-hover:text-[#e6edf3]"
              )} />
              {tab.label}
              
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
              )}
            </Button>
          );
        })}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-card p-6">
            <h2 className="text-sm font-semibold text-[#e6edf3] mb-5">
              Progress by difficulty
            </h2>
            <div className="space-y-5">
              {(["easy", "medium", "hard"] as const).map((diff) => {
                const { solved, total } = difficultyMap[diff];
                const pct =
                  total > 0 ? Math.round((solved / total) * 100) : 0;
                const colors = {
                  easy: { bar: "bg-emerald-500", text: "text-emerald-400" },
                  medium: { bar: "bg-amber-500", text: "text-amber-400" },
                  hard: { bar: "bg-red-500", text: "text-red-400" },
                };
                return (
                  <div key={diff}>
                    <div className="flex items-center justify-between mb-2">
                      <DifficultyBadge difficulty={diff} />
                      <span
                        className={cn(
                          "text-xs font-mono font-semibold",
                          colors[diff].text
                        )}
                      >
                        {solved}/{total} solved
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[#21262d] overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-700",
                          colors[diff].bar
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {data && data.recentAttempts.length > 0 && (
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-[#e6edf3]">
                  Recent activity
                </h2>
                <button
                  onClick={() => setActiveTab("attempts")}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  View all
                </button>
              </div>
              <div className="space-y-2">
                {data.recentAttempts.slice(0, 5).map((attempt) => (
                  <AttemptsList key={attempt.id} attempt={attempt} compact />
                ))}
              </div>
            </div>
          )}

          {(!data || stats?.totalAttempts === 0) && (
            <EmptyState
              icon={Code2}
              title="No activity yet"
              description="Run your first SQL query to start tracking your progress here."
              buttonText="Start solving"
              buttonLink="/assignments"
            />
          )}
        </div>
      )}

      {activeTab === "solved" && (
        <div className="animate-fade-in">
          {data && data.solved.length > 0 ? (
            <div className="space-y-3">
              {data.solved.map((item) => (
                <SolvedItem
                  key={item.id}
                  item={item}
                  expandedQuery={expandedQuery}
                  onToggleExpand={(id) =>
                    setExpandedQuery(expandedQuery === id ? null : id)
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Trophy}
              title="No solved problems yet"
              description="A problem is marked solved only when your query passes all validation checks — correct columns, row count, and values."
              buttonText="Browse assignments"
              buttonLink="/assignments"
            />
          )}
        </div>
      )}

      {activeTab === "attempts" && (
        <div className="animate-fade-in">
          {data && data.recentAttempts.length > 0 ? (
            <div className="space-y-2">
              {data.recentAttempts.map((attempt) => (
                <AttemptsList key={attempt.id} attempt={attempt} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Clock}
              title="No attempts yet"
              description="Every query you run will appear here."
              buttonText="Browse assignments"
              buttonLink="/assignments"
            />
          )}
        </div>
      )}
    </div>
  );
}
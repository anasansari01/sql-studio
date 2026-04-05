"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Trophy, Layers, 
  BookOpen, Filter, CheckCircle2,
  Search, SortAsc,
} from "lucide-react";
import { cn } from "@/lib/utils";
import CategoryHubCard from "./categoryHubCard";

interface CategoryCard {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  displayOrder: number;
  totalAssignments: number;
  solvedAssignments: number;
}

type SortMode = "order" | "progress-asc" | "progress-desc" | "name";
type FilterMode = "all" | "in-progress" | "completed" | "not-started";


export function HubClient() {
  const [categories, setCategories] = useState<CategoryCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("order");
  const [filter, setFilter] = useState<FilterMode>("all");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/hub", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setCategories(data.categories ?? []);
    } catch (err) {
      console.error("[HubClient] fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalAssignments = categories.reduce((s, c) => s + c.totalAssignments, 0);
  const totalSolved = categories.reduce((s, c) => s + c.solvedAssignments, 0);
  const completedCats = categories.filter(
    (c) => c.totalAssignments > 0 && c.solvedAssignments >= c.totalAssignments
  ).length;
  const inProgressCats = categories.filter(
    (c) => c.solvedAssignments > 0 && c.solvedAssignments < c.totalAssignments
  ).length;

  const visible = categories
    .filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filter === "completed") return c.totalAssignments > 0 && c.solvedAssignments >= c.totalAssignments;
      if (filter === "in-progress") return c.solvedAssignments > 0 && c.solvedAssignments < c.totalAssignments;
      if (filter === "not-started") return c.solvedAssignments === 0;
      return true;
    })
    .sort((a, b) => {
      if (sort === "progress-desc") return b.solvedAssignments / Math.max(b.totalAssignments, 1) - a.solvedAssignments / Math.max(a.totalAssignments, 1);
      if (sort === "progress-asc") return a.solvedAssignments / Math.max(a.totalAssignments, 1) - b.solvedAssignments / Math.max(b.totalAssignments, 1);
      if (sort === "name") return a.name.localeCompare(b.name);
      return a.displayOrder - b.displayOrder;
    });

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-9 w-9 rounded-xl bg-indigo-600/20 flex items-center justify-center">
            <Layers className="h-5 w-5 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-[#e6edf3]">Assignment Hub</h1>
        </div>
        <p className="text-[#8b949e] text-sm ml-12">
          Browse categories, track your SQL progress, and work through questions sequentially.
        </p>
      </div>

      {!isLoading && categories.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Categories", value: categories.length, icon: Layers, color: "text-indigo-400", bg: "bg-indigo-900/20" },
            { label: "Total problems", value: totalAssignments, icon: BookOpen, color: "text-sky-400", bg: "bg-sky-900/20" },
            { label: "Solved", value: totalSolved, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-900/20" },
            { label: "Completed sets", value: completedCats, icon: Trophy, color: "text-amber-400", bg: "bg-amber-900/20" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-4 flex flex-col gap-2.5">
              <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center", stat.bg)}>
                <stat.icon className={cn("h-3.5 w-3.5", stat.color)} />
              </div>
              <div>
                <p className="text-lg font-bold text-[#e6edf3]">{stat.value}</p>
                <p className="text-xs text-[#8b949e]">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#484f58]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories…"
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#0f1117] border border-[#30363d] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm text-[#e6edf3] placeholder-[#484f58] transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-[#484f58] shrink-0" />
          {(["all", "in-progress", "completed", "not-started"] as FilterMode[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border whitespace-nowrap",
                filter === f
                  ? "bg-indigo-600 text-white border-indigo-500"
                  : "bg-[#21262d] text-[#8b949e] border-[#30363d] hover:text-[#e6edf3]"
              )}
            >
              {f === "all" ? "All" : f === "in-progress" ? "In progress" : f === "completed" ? "Completed" : "Not started"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          <SortAsc className="h-3.5 w-3.5 text-[#484f58] shrink-0" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            className="bg-[#21262d] border border-[#30363d] text-[#8b949e] text-xs rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
          >
            <option value="order">Default order</option>
            <option value="name">Name A–Z</option>
            <option value="progress-desc">Most progress</option>
            <option value="progress-asc">Least progress</option>
          </select>
        </div>
      </div>

      {!isLoading && visible.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((cat, idx) => (
            <CategoryHubCard key={cat.id} category={cat} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}
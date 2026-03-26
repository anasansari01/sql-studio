import { LegendItem } from "./legendItem";

interface DashboardStats {
  totalSolved: number;
  totalAttempts: number;
  correctAttempts: number;
  wrongAttempts: number;
  errorAttempts: number;
  successRate: number;
}

interface AttemptBreakdownBarProps {
  stats: DashboardStats;
}

export function AttemptBreakdownBar({ stats }: AttemptBreakdownBarProps) {
  const emptyCount =
    stats.totalAttempts - stats.correctAttempts - stats.wrongAttempts - stats.errorAttempts;

  return (
    <div className="glass-card p-4 mb-8">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
          Attempt breakdown
        </p>
        <p className="text-xs text-[#484f58]">{stats.totalAttempts} total</p>
      </div>
      <div className="flex h-3 rounded-full overflow-hidden bg-[#21262d] gap-px">
        {stats.correctAttempts > 0 && (
          <div
            className="bg-emerald-500 transition-all duration-700"
            style={{
              width: `${(stats.correctAttempts / stats.totalAttempts) * 100}%`,
            }}
          />
        )}
        {stats.wrongAttempts > 0 && (
          <div
            className="bg-amber-500 transition-all duration-700"
            style={{
              width: `${(stats.wrongAttempts / stats.totalAttempts) * 100}%`,
            }}
          />
        )}
        {stats.errorAttempts > 0 && (
          <div
            className="bg-red-500 transition-all duration-700"
            style={{
              width: `${(stats.errorAttempts / stats.totalAttempts) * 100}%`,
            }}
          />
        )}
      </div>
      <div className="flex items-center gap-4 mt-2 flex-wrap">
        <LegendItem color="bg-emerald-500" label="Correct" count={stats.correctAttempts} />
        <LegendItem color="bg-amber-500" label="Wrong answer" count={stats.wrongAttempts} />
        <LegendItem color="bg-red-500" label="SQL error" count={stats.errorAttempts} />
        {emptyCount > 0 && (
          <LegendItem color="bg-[#484f58]" label="Empty result" count={emptyCount} />
        )}
      </div>
    </div>
  );
}
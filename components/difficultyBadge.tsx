import { cn } from "@/lib/utils";

type Difficulty = "easy" | "medium" | "hard";

interface Props {
  difficulty: Difficulty;
  size?: "sm" | "md";
}

const config: Record<Difficulty, { label: string; className: string }> = {
  easy: {
    label: "Easy",
    className:
      "bg-emerald-900/40 text-emerald-400 border border-emerald-800/50",
  },
  medium: {
    label: "Medium",
    className: "bg-amber-900/40 text-amber-400 border border-amber-800/50",
  },
  hard: {
    label: "Hard",
    className: "bg-red-900/40 text-red-400 border border-red-800/50",
  },
};

export function DifficultyBadge({ difficulty, size = "sm" }: Props) {
  const { label, className } = config[difficulty];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className
      )}
    >
      {label}
    </span>
  );
}
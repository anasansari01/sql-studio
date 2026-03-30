import { cn } from "@/lib/utils";

interface LegendItemProps {
  color: string;
  label: string;
  count: number;
}

export function LegendItem({ color, label, count }: LegendItemProps) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("h-2 w-2 rounded-full shrink-0", color)} />
      <span className="text-xs text-[#484f58]">
        {label}:{" "}
        <span className="text-[#8b949e] font-medium">{count}</span>
      </span>
    </div>
  );
}
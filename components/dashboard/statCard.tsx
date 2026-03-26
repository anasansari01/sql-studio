import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  iconClass: string;
  bgClass: string;
}

export function StatCard({ icon: Icon, label, value, iconClass, bgClass }: StatCardProps) {
  return (
    <div className="glass-card p-4 flex flex-col gap-3 transition-colors">
      <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", bgClass)}>
        <Icon className={cn("h-4 w-4", iconClass)} />
      </div>
      <div>
        <p className="text-xl font-bold text-[#e6edf3]">{value}</p>
        <p className="text-xs text-[#8b949e] mt-0.5">{label}</p>
      </div>
    </div>
  );
}
import { cn } from '@/lib/utils';
import React from 'react'

function StatCard({
  icon: Icon,
  label,
  value,
  iconClass,
  bgClass,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  iconClass: string;
  bgClass: string;
}) {
  return (
    <div className="glass-card p-4 flex flex-col gap-3">
      <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", bgClass)}>
        <Icon className={cn("h-4 w-4", iconClass)} />
      </div>
      <div>
        <p className="text-xl font-bold text-[#e6edf3]">{value}</p>
        <p className="text-xs text-[#8b949e]">{label}</p>
      </div>
    </div>
  );
}

export default StatCard;
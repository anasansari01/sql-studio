import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  buttonText,
  buttonLink,
}: EmptyStateProps) {
  return (
    <div className="glass-card p-12 text-center">
      <div className="h-14 w-14 rounded-2xl bg-indigo-900/30 flex items-center justify-center mx-auto mb-4">
        <Icon className="h-7 w-7 text-indigo-400" />
      </div>
      <h3 className="text-[#e6edf3] font-semibold mb-2">{title}</h3>
      <p className="text-[#8b949e] text-sm mb-5 max-w-xs mx-auto">{description}</p>
      <Link href={buttonLink} className="btn-primary text-sm inline-flex">
        <ArrowRight className="h-4 w-4" />
        {buttonText}
      </Link>
    </div>
  );
}
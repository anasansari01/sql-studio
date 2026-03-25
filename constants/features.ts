import { Database, Zap, Brain, Code2, ArrowRight } from "lucide-react";

export const features = [
  {
    title: "Real SQL Execution",
    description:
      "Your queries run against actual PostgreSQL tables with real data.",
    icon: Database,
    iconBg: "bg-indigo-900/40",
    iconColor: "text-indigo-400",
  },
  {
    title: "Monaco Code Editor",
    description:
      "The same editor that powers VS Code.",
    icon: Code2,
    iconBg: "bg-purple-900/40",
    iconColor: "text-purple-400",
  },
  {
    title: "AI-Powered Hints",
    description:
      "Get a conceptual nudge without spoilers.",
    icon: Brain,
    iconBg: "bg-amber-900/40",
    iconColor: "text-amber-400",
  },
  {
    title: "Instant Feedback",
    description:
      "See results in milliseconds.",
    icon: Zap,
    iconBg: "bg-emerald-900/40",
    iconColor: "text-emerald-400",
  },
  {
    title: "Schema Explorer",
    description:
      "Browse tables before writing SQL.",
    icon: Database,
    iconBg: "bg-sky-900/40",
    iconColor: "text-sky-400",
  },
  {
    title: "Multiple Difficulty Levels",
    description:
      "From beginner to advanced queries.",
    icon: ArrowRight,
    iconBg: "bg-pink-900/40",
    iconColor: "text-pink-400",
  },
];
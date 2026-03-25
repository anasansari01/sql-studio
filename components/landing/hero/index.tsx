import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-center px-4 py-24 text-center overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(to right, #6366f1 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-125 w-175 rounded-full bg-indigo-600/10 blur-3xl" />

      <div className="relative z-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-400 mb-6">
          <Zap className="h-3.5 w-3.5" />
          Real-time SQL execution with AI hints
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#e6edf3] mb-6 tracking-tight">
          Master SQL by{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400">
            doing, not reading
          </span>
        </h1>

        <p className="text-lg text-[#8b949e] max-w-xl mx-auto leading-relaxed mb-10">
          Write real SQL queries against pre-loaded datasets, see instant
          results, and get AI-powered hints when you're stuck.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/assignments"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3"
          >
            Browse Assignments
            <ArrowRight className="h-4 w-4" />
          </Link>

          <a
            href="#features"
            className="flex items-center gap-2 rounded-xl border border-[#30363d] text-[#8b949e] px-6 py-3"
          >
            Learn more
          </a>
        </div>
      </div>
    </section>
  );
}
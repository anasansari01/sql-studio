import Link from "next/link";
import { Database } from "lucide-react";

export default function CTASection() {
  return (
    <section className="px-4 py-16 mt-auto">
      <div className="max-w-2xl mx-auto text-center glass-card p-10 border-indigo-500/20">
        <h2 className="text-2xl font-bold text-[#e6edf3] mb-3">
          Ready to write your first query?
        </h2>

        <p className="text-[#8b949e] mb-6">
          Pick an assignment, open the editor, and start querying real data.
        </p>

        <Link
          href="/assignments"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white font-semibold px-6 py-3"
        >
          <Database className="h-4 w-4" />
          Start practicing
        </Link>
      </div>
    </section>
  );
}
import Link from "next/link";
import { Database, Zap, Lightbulb, Code2 } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0f1117] text-[#e6edf3] px-4 py-16">
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            About SQL Studio
          </h1>
          <p className="text-[#8b949e] max-w-2xl mx-auto">
            SQL Studio is built for one simple idea — the best way to learn SQL
            is to actually write it.
          </p>
        </div>

        <div className="space-y-6 text-[#c9d1d9] leading-relaxed">
          <p>
            Most platforms teach SQL like a textbook. You read concepts, maybe
            see examples, and then move on. But when it’s time to write real
            queries, things suddenly feel… different.
          </p>

          <p>
            SQL Studio flips that model. Instead of passively consuming content,
            you learn by doing. Every concept is paired with real datasets,
            interactive challenges, and instant feedback.
          </p>

          <p>
            It’s like having a SQL playground, a mentor, and a challenge platform
            all in one place.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="border border-[#30363d] rounded-xl p-5 bg-[#161b22]">
            <div className="flex items-center gap-2 mb-3 text-indigo-400">
              <Zap className="h-4 w-4" />
              <h3 className="font-semibold">Real-time execution</h3>
            </div>
            <p className="text-sm text-[#8b949e]">
              Write SQL queries and instantly see results. No setup, no friction.
            </p>
          </div>

          <div className="border border-[#30363d] rounded-xl p-5 bg-[#161b22]">
            <div className="flex items-center gap-2 mb-3 text-indigo-400">
              <Database className="h-4 w-4" />
              <h3 className="font-semibold">Real datasets</h3>
            </div>
            <p className="text-sm text-[#8b949e]">
              Practice on structured data that feels like real-world scenarios.
            </p>
          </div>

          <div className="border border-[#30363d] rounded-xl p-5 bg-[#161b22]">
            <div className="flex items-center gap-2 mb-3 text-indigo-400">
              <Lightbulb className="h-4 w-4" />
              <h3 className="font-semibold">AI-powered hints</h3>
            </div>
            <p className="text-sm text-[#8b949e]">
              Get unstuck with contextual hints instead of full solutions.
            </p>
          </div>

          <div className="border border-[#30363d] rounded-xl p-5 bg-[#161b22]">
            <div className="flex items-center gap-2 mb-3 text-indigo-400">
              <Code2 className="h-4 w-4" />
              <h3 className="font-semibold">Hands-on learning</h3>
            </div>
            <p className="text-sm text-[#8b949e]">
              Learn by solving problems, not by memorizing syntax.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-xl font-semibold mb-3">
            Learn like a developer
          </h2>
          <p className="text-[#8b949e] max-w-xl mx-auto">
            You don’t learn programming by reading alone. You learn by trying,
            failing, fixing, and repeating. SQL Studio is designed around that
            loop.
          </p>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/assignments"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3"
          >
            <Database className="h-4 w-4" />
            Start practicing
          </Link>
        </div>
      </div>
    </div>
  );
}
import { Table2 } from "lucide-react";

interface Assignment {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  sandboxSchema: string;
  tables: unknown;
  expectedColumns: string | null;
}

export function QuestionPanel({ assignment }: { assignment: Assignment }) {
  const tableNames = (assignment.tables as string[]) ?? [];

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-base font-semibold text-[#e6edf3] mb-1">{assignment.title}</h2>
        <p className="text-[#8b949e] text-xs leading-relaxed">{assignment.description}</p>
      </div>

      <div className="h-px bg-[#21262d]" />

      <div>
        <p className="section-label mb-2">Task</p>
        <div className="rounded-lg bg-[#0f1117] border border-[#30363d] p-4">
          <p className="text-[#e6edf3] text-sm leading-relaxed whitespace-pre-line">{assignment.question}</p>
        </div>
      </div>

      <div>
        <p className="section-label mb-2">Tables available</p>
        <div className="flex flex-wrap gap-1.5">
          {tableNames.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 text-xs font-mono bg-[#21262d] border border-[#30363d] text-[#8b949e] px-2 py-1 rounded-md"
            >
              <Table2 className="h-3 w-3 text-indigo-400" />
              {t}
            </span>
          ))}
        </div>
      </div>

      {assignment.expectedColumns && (
        <div>
          <p className="section-label mb-2">Expected output columns</p>
          <p className="text-xs font-mono text-[#8b949e] bg-[#0f1117] border border-[#30363d] rounded-lg px-3 py-2">
            {assignment.expectedColumns}
          </p>
        </div>
      )}

      <div className="rounded-lg bg-indigo-900/15 border border-indigo-500/20 p-3">
        <p className="text-xs text-indigo-400/80 leading-relaxed">
          <span className="font-semibold text-indigo-400">Tip:</span> Press{" "}
          <kbd className="font-mono text-[10px] bg-indigo-900/40 border border-indigo-500/30 px-1 py-px rounded">
            Ctrl+Enter
          </kbd>{" "}
          inside the editor to run your query instantly.
        </p>
      </div>
    </div>
  );
}

export default QuestionPanel;
"use client";

import TabButtons from "./tabButton";
import QuestionPanel from "./questionPanel";
import { SchemaViewer } from "./schemaViewer";
import { BookOpen, Database } from "lucide-react";

interface TableInfo {
  tableName: string;
  columns: { column_name: string; data_type: string; is_nullable: string }[];
  sampleRows: Record<string, unknown>[];
}

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

type LeftTab = "question" | "schema";

const LEFT_TABS = [
  { id: "question" as const, icon: BookOpen, label: "Problem" },
  { id: "schema" as const, icon: Database, label: "Schema" },
];

interface LeftPanelProps {
  assignment: Assignment;
  schemaInfo: TableInfo[];
  leftTab: LeftTab;
  setLeftTab: (tab: LeftTab) => void;
}

export function LeftPanel({ assignment, schemaInfo, leftTab, setLeftTab }: LeftPanelProps) {
  return (
    <div className="w-80 xl:w-96 shrink-0 flex flex-col border-r border-[#30363d] bg-[#161b22] overflow-hidden">
      <TabButtons tabs={LEFT_TABS} activeTab={leftTab} onChange={setLeftTab} />
      <div className="flex-1 overflow-y-auto p-4">
        {leftTab === "question" && <QuestionPanel assignment={assignment} />}
        {leftTab === "schema" && <SchemaViewer schemaInfo={schemaInfo} />}
      </div>
    </div>
  );
}

export default LeftPanel;
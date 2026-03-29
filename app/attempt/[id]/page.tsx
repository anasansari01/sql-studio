import { notFound } from "next/navigation";
import { AttemptClient } from "@/components/coding/AttemptClient";

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
  createdAt: string;
}

async function getAssignment(
  id: string
): Promise<{ assignment: Assignment; schemaInfo: TableInfo[] } | null> {
  try {
    const baseUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/assignments/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function AttemptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getAssignment(id);

  if (!data) notFound();

  return (
    <AttemptClient
      assignment={data.assignment}
      schemaInfo={data.schemaInfo}
    />
  );
}
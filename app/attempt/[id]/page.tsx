import { notFound } from "next/navigation";
import { db } from "@/db/client";
import { assignments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSchemaInfo } from "@/lib/getSchemaInfo";
import { AttemptClient } from "@/components/coding/AttemptClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [a] = await db
    .select({ title: assignments.title })
    .from(assignments)
    .where(eq(assignments.id, id))
    .limit(1);

  return {
    title: a ? `${a.title} — SQLStudio` : "Problem — SQLStudio",
  };
}

export default async function AttemptPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string; category?: string }>;
}) {
  const { id } = await params;
  const { from, category } = await searchParams;

  const [assignment] = await db
    .select({
      id: assignments.id,
      title: assignments.title,
      description: assignments.description,
      difficulty: assignments.difficulty,
      question: assignments.question,
      sandboxSchema: assignments.sandboxSchema,
      tables: assignments.tables,
      expectedColumns: assignments.expectedColumns,
      createdAt: assignments.createdAt,
      updatedAt: assignments.updatedAt,
    })
    .from(assignments)
    .where(eq(assignments.id, id))
    .limit(1);

  if (!assignment) notFound();

  const schemaInfo = await getSchemaInfo(
    assignment.sandboxSchema,
    (assignment.tables as string[]) ?? []
  );

  const backHref =
    from === "hub" && category ? `/hub/${category}` : "/assignments";

  const backLabel =
    from === "hub" && category ? "Back to category" : "Assignments";

  return (
    <AttemptClient
      assignment={assignment}
      schemaInfo={schemaInfo}
      backHref={backHref}
      backLabel={backLabel}
    />
  );
}
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { assignments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSchemaInfo } from "@/lib/getSchemaInfo";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
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
        isActive: assignments.isActive,
        createdAt: assignments.createdAt,
        updatedAt: assignments.updatedAt,
      })
      .from(assignments)
      .where(eq(assignments.id, id))
      .limit(1);

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found." },
        { status: 404 }
      );
    }

    const tableNames = assignment.tables as string[];
    const schemaInfo = await getSchemaInfo(assignment.sandboxSchema, tableNames);

    return NextResponse.json({ assignment, schemaInfo });
  } catch (err) {
    console.error("[GET /api/assignments/:id]", err);
    return NextResponse.json(
      { error: "Failed to fetch assignment." },
      { status: 500 }
    );
  }
}
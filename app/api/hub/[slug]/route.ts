import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import {
  categories,
  assignmentCategories,
  assignments,
  solvedAssignments,
} from "@/db/schema";
import { eq, and, inArray, asc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const user = await getSession();

    const [cat] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);

    if (!cat) {
      return NextResponse.json(
        { error: "Category not found." },
        { status: 404 }
      );
    }

    const links = await db
      .select({
        assignmentId: assignmentCategories.assignmentId,
        position: assignmentCategories.position,
      })
      .from(assignmentCategories)
      .where(eq(assignmentCategories.categoryId, cat.id))
      .orderBy(asc(assignmentCategories.position));

    const assignmentIds = links.map((l) => l.assignmentId);

    if (assignmentIds.length === 0) {
      return NextResponse.json({
        category: cat,
        assignments: [],
        solvedIds: [],
      });
    }

    const rows = await db
      .select({
        id: assignments.id,
        title: assignments.title,
        description: assignments.description,
        difficulty: assignments.difficulty,
        question: assignments.question,
        tables: assignments.tables,
        expectedColumns: assignments.expectedColumns,
        sandboxSchema: assignments.sandboxSchema,
        createdAt: assignments.createdAt,
      })
      .from(assignments)
      .where(inArray(assignments.id, assignmentIds));

    const posMap = Object.fromEntries(
      links.map((l) => [l.assignmentId, l.position])
    );

    const sorted = rows.sort(
      (a, b) => (posMap[a.id] ?? 0) - (posMap[b.id] ?? 0)
    );

    let solvedIds: string[] = [];

    if (user) {
      const solved = await db
        .select({ assignmentId: solvedAssignments.assignmentId })
        .from(solvedAssignments)
        .where(
          and(
            eq(solvedAssignments.userId, user.id),
            inArray(solvedAssignments.assignmentId, assignmentIds)
          )
        );

      solvedIds = solved.map((s) => s.assignmentId);
    }

    return NextResponse.json({
      category: {
        id: cat.id,
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
      },
      assignments: sorted.map((a) => ({
        ...a,
        tables: (a.tables as string[]) ?? [],
        createdAt: a.createdAt.toISOString(),
      })),
      solvedIds,
    });
  } catch (err) {
    console.error("[GET /api/hub/:slug]", err);
    return NextResponse.json(
      { error: "Failed to load category." },
      { status: 500 }
    );
  }
}
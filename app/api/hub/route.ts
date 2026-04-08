import { NextResponse } from "next/server";
import { db } from "@/db/client";
import {
  categories,
  assignmentCategories,
  solvedAssignments,
} from "@/db/schema";
import { eq, count, inArray, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSession();

    const cats = await db
      .select({
        id: categories.id,
        slug: categories.slug,
        name: categories.name,
        description: categories.description,
        icon: categories.icon,
        color: categories.color,
        displayOrder: categories.displayOrder,
        totalAssignments: count(assignmentCategories.assignmentId),
      })
      .from(categories)
      .leftJoin(
        assignmentCategories,
        eq(categories.id, assignmentCategories.categoryId)
      )
      .where(eq(categories.isActive, true))
      .groupBy(
        categories.id,
        categories.slug,
        categories.name,
        categories.description,
        categories.icon,
        categories.color,
        categories.displayOrder
      )
      .orderBy(categories.displayOrder);

    if (cats.length === 0) {
      return NextResponse.json({ categories: [] });
    }

    let solvedCountMap: Record<string, number> = {};

    if (user) {
      const links = await db
        .select({
          categoryId: assignmentCategories.categoryId,
          assignmentId: assignmentCategories.assignmentId,
        })
        .from(assignmentCategories)
        .where(
          inArray(
            assignmentCategories.categoryId,
            cats.map((c) => c.id)
          )
        );

      const allAssignmentIds = [...new Set(links.map((l) => l.assignmentId))];

      const userSolved =
        allAssignmentIds.length > 0
          ? await db
              .select({ assignmentId: solvedAssignments.assignmentId })
              .from(solvedAssignments)
              .where(
                and(
                  eq(solvedAssignments.userId, user.id),
                  inArray(solvedAssignments.assignmentId, allAssignmentIds)
                )
              )
          : [];

      const solvedSet = new Set(userSolved.map((s) => s.assignmentId));

      for (const link of links) {
        if (solvedSet.has(link.assignmentId)) {
          solvedCountMap[link.categoryId] =
            (solvedCountMap[link.categoryId] ?? 0) + 1;
        }
      }
    }

    const result = cats.map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      description: cat.description,
      icon: cat.icon,
      color: cat.color,
      displayOrder: cat.displayOrder,
      totalAssignments: Number(cat.totalAssignments),
      solvedAssignments: solvedCountMap[cat.id] ?? 0,
    }));

    return NextResponse.json({ categories: result });
  } catch (err) {
    console.error("[GET /api/hub]", err);
    return NextResponse.json(
      { error: "Failed to load hub data." },
      { status: 500 }
    );
  }
}
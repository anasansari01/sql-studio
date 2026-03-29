import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { assignments } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const data = await db
      .select({
        id: assignments.id,
        title: assignments.title,
        description: assignments.description,
        difficulty: assignments.difficulty,
        tables: assignments.tables,
        createdAt: assignments.createdAt,
      })
      .from(assignments)
      .where(eq(assignments.isActive, true))
      .orderBy(assignments.createdAt);

    return NextResponse.json({ assignments: data });
  } catch (err) {
    console.error("[GET /api/assignments]", err);
    return NextResponse.json(
      { error: "Failed to fetch assignments." },
      { status: 500 }
    );
  }
}
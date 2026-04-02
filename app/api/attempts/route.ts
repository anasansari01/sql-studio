import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { attempts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const assignmentId = searchParams.get("assignmentId");

  if (!assignmentId) {
    return NextResponse.json(
      { error: "assignmentId query param is required." },
      { status: 400 }
    );
  }

  try {
    const data = await db
      .select()
      .from(attempts)
      .where(eq(attempts.assignmentId, assignmentId))
      .orderBy(desc(attempts.createdAt))
      .limit(20);

    return NextResponse.json({ attempts: data });
  } catch (err) {
    console.error("[GET /api/attempts]", err);
    return NextResponse.json(
      { error: "Failed to fetch attempts." },
      { status: 500 }
    );
  }
}
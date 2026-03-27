import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { attempts, solvedAssignments, assignments } from "@/db/schema";
import { eq, desc, count, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const solved = await db
      .select({
        id: solvedAssignments.id,
        assignmentId: solvedAssignments.assignmentId,
        bestQuery: solvedAssignments.bestQuery,
        solvedAt: solvedAssignments.solvedAt,
        title: assignments.title,
        difficulty: assignments.difficulty,
        description: assignments.description,
      })
      .from(solvedAssignments)
      .innerJoin(
        assignments,
        eq(solvedAssignments.assignmentId, assignments.id)
      )
      .where(eq(solvedAssignments.userId, user.id))
      .orderBy(desc(solvedAssignments.solvedAt));

    const recentAttempts = await db
      .select({
        id: attempts.id,
        assignmentId: attempts.assignmentId,
        sqlQuery: attempts.sqlQuery,
        status: attempts.status,
        rowCount: attempts.rowCount,
        errorMessage: attempts.errorMessage,
        executionTimeMs: attempts.executionTimeMs,
        createdAt: attempts.createdAt,
        assignmentTitle: assignments.title,
        difficulty: assignments.difficulty,
      })
      .from(attempts)
      .innerJoin(assignments, eq(attempts.assignmentId, assignments.id))
      .where(eq(attempts.userId, user.id))
      .orderBy(desc(attempts.createdAt))
      .limit(15);

    const [totalAttemptsRow] = await db
      .select({ count: count() })
      .from(attempts)
      .where(eq(attempts.userId, user.id));

    const [successAttemptsRow] = await db
      .select({ count: count() })
      .from(attempts)
      .where(
        sql`${attempts.userId} = ${user.id} AND ${attempts.status} = 'success'`
      );

    const difficultyBreakdown = await db
      .select({
        difficulty: assignments.difficulty,
        solved: count(),
      })
      .from(solvedAssignments)
      .innerJoin(
        assignments,
        eq(solvedAssignments.assignmentId, assignments.id)
      )
      .where(eq(solvedAssignments.userId, user.id))
      .groupBy(assignments.difficulty);

    const totalPerDifficulty = await db
      .select({
        difficulty: assignments.difficulty,
        total: count(),
      })
      .from(assignments)
      .where(eq(assignments.isActive, true))
      .groupBy(assignments.difficulty);

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
      stats: {
        totalAttempts: totalAttemptsRow?.count ?? 0,
        successfulAttempts: successAttemptsRow?.count ?? 0,
        totalSolved: solved.length,
      },
      solved,
      recentAttempts,
      difficultyBreakdown,
      totalPerDifficulty,
    });
  } catch (err) {
    console.error("[GET /api/dashboard]", err);
    return NextResponse.json(
      { error: "Failed to load dashboard data." },
      { status: 500 }
    );
  }
}
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/db/client";
import { attempts, solvedAssignments, assignments } from "@/db/schema";
import { eq, desc, count, and } from "drizzle-orm";
import { DashboardClient } from "@/components/dashboard/dashboardClient";

async function getDashboardData(userId: string) {
  const [
    solved,
    recentAttempts,
    totalAttemptsRow,
    correctAttemptsRow,
    wrongAttemptsRow,
    errorAttemptsRow,
    difficultyBreakdown,
    totalPerDifficulty,
  ] = await Promise.all([
    db
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
      .innerJoin(assignments, eq(solvedAssignments.assignmentId, assignments.id))
      .where(eq(solvedAssignments.userId, userId))
      .orderBy(desc(solvedAssignments.solvedAt)),

    db
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
      .where(eq(attempts.userId, userId))
      .orderBy(desc(attempts.createdAt))
      .limit(15),

    db
      .select({ count: count() })
      .from(attempts)
      .where(eq(attempts.userId, userId)),

    db
      .select({ count: count() })
      .from(attempts)
      .where(and(eq(attempts.userId, userId), eq(attempts.status, "correct"))),

    db
      .select({ count: count() })
      .from(attempts)
      .where(and(eq(attempts.userId, userId), eq(attempts.status, "wrong"))),

    db
      .select({ count: count() })
      .from(attempts)
      .where(and(eq(attempts.userId, userId), eq(attempts.status, "error"))),

    db
      .select({ difficulty: assignments.difficulty, solved: count() })
      .from(solvedAssignments)
      .innerJoin(assignments, eq(solvedAssignments.assignmentId, assignments.id))
      .where(eq(solvedAssignments.userId, userId))
      .groupBy(assignments.difficulty),

    db
      .select({ difficulty: assignments.difficulty, total: count() })
      .from(assignments)
      .where(eq(assignments.isActive, true))
      .groupBy(assignments.difficulty),
  ]);

  const totalAttempts = Number(totalAttemptsRow[0]?.count ?? 0);
  const correctAttempts = Number(correctAttemptsRow[0]?.count ?? 0);
  const wrongAttempts = Number(wrongAttemptsRow[0]?.count ?? 0);
  const errorAttempts = Number(errorAttemptsRow[0]?.count ?? 0);

  const successRate =
    totalAttempts > 0
      ? Math.round((correctAttempts / totalAttempts) * 100)
      : 0;

  const solvedWithStringDate = solved.map((s) => ({
    ...s,
    solvedAt: s.solvedAt.toISOString(),
  }));

  const recentAttemptsWithStringDate = recentAttempts.map((a) => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
  }));

  return {
    stats: {
      totalSolved: solved.length,
      totalAttempts,
      correctAttempts,
      wrongAttempts,
      errorAttempts,
      successRate,
    },
    solved: solvedWithStringDate,
    recentAttempts: recentAttemptsWithStringDate,
    difficultyBreakdown,
    totalPerDifficulty,
  };
}

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const data = await getDashboardData(user.id);

  return <DashboardClient initialData={data} user={user} />;
}
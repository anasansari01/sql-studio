import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { assignments, attempts, solvedAssignments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sanitizeQuery } from "@/lib/sanitizeQuery";
import { executeSandboxQuery } from "@/lib/executeSandboxQuery";
import { validateAnswer } from "@/lib/validateAnswer";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const executeSchema = z.object({
  assignmentId: z.string().uuid(),
  query: z.string().min(1).max(5000),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to run queries." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = executeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { assignmentId, query } = parsed.data;

    const sanitizeResult = sanitizeQuery(query);
    if (!sanitizeResult.ok) {
      return NextResponse.json(
        { error: sanitizeResult.reason },
        { status: 400 }
      );
    }

    const [assignment] = await db
      .select({
        sandboxSchema: assignments.sandboxSchema,
        solutionQuery: assignments.solutionQuery,
      })
      .from(assignments)
      .where(eq(assignments.id, assignmentId))
      .limit(1);

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found." },
        { status: 404 }
      );
    }

    const execResult = await executeSandboxQuery(query, assignment.sandboxSchema);

    if (!execResult.success) {
      await db.insert(attempts).values({
        userId: user.id,
        assignmentId,
        sqlQuery: query,
        status: "error",
        rowCount: 0,
        errorMessage: execResult.error.message,
        executionTimeMs: null,
      });

      return NextResponse.json({
        result: null,
        error: execResult.error,
        validation: null,
        solved: false,
      });
    }

    const validation = await validateAnswer(
      query,
      assignment.solutionQuery,
      assignment.sandboxSchema,
      {
        columns: execResult.data.columns,
        rows: execResult.data.rows,
        rowCount: execResult.data.rowCount,
      }
    );

    let attemptStatus: "correct" | "wrong" | "empty";
    if (execResult.data.rowCount === 0) {
      attemptStatus = "empty";
    } else if (validation.isCorrect) {
      attemptStatus = "correct";
    } else {
      attemptStatus = "wrong";
    }

    await db.insert(attempts).values({
      userId: user.id,
      assignmentId,
      sqlQuery: query,
      status: attemptStatus,
      rowCount: execResult.data.rowCount,
      errorMessage: null,
      executionTimeMs: execResult.data.executionTimeMs,
    });

    if (attemptStatus === "correct") {
      await db
        .insert(solvedAssignments)
        .values({
          userId: user.id,
          assignmentId,
          bestQuery: query,
        })
        .onConflictDoNothing();
    }

    return NextResponse.json({
      result: execResult.data,
      error: null,
      validation: {
        isCorrect: validation.isCorrect,
        feedback: validation.feedback,
        expectedColumns: validation.expectedColumns,
        studentColumns: validation.studentColumns,
        expectedRowCount: validation.expectedRowCount,
        studentRowCount: validation.studentRowCount,
      },
      solved: attemptStatus === "correct",
    });
  } catch (err) {
    console.error("[POST /api/execute]", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
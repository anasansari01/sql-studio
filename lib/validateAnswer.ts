import { executeSandboxQuery } from "./executeSandboxQuery";

export interface ValidationResult {
  isCorrect: boolean;
  feedback: string;
  expectedColumns?: string[];
  studentColumns?: string[];
  expectedRowCount?: number;
  studentRowCount?: number;
  mismatchedRows?: string[];
}

export async function validateAnswer(
  studentQuery: string,
  solutionQuery: string,
  sandboxSchema: string,
  preExecutedStudentResult?: {
    columns: string[];
    rows: Record<string, unknown>[];
    rowCount: number;
  }
): Promise<ValidationResult> {

  const solutionResult = await executeSandboxQuery(
    solutionQuery.trim(),
    sandboxSchema
  );

  if (!solutionResult.success) {
    console.error("[validateAnswer] Solution query failed:", solutionResult.error);
    return {
      isCorrect: false,
      feedback: "Internal error: the reference solution failed. Please contact support.",
    };
  }

  const expectedCols = solutionResult.data.columns.slice().sort();
  const expectedRowCount = solutionResult.data.rowCount;

  let studentCols: string[] = [];
  let studentRowCount = 0;
  let studentRows: Record<string, unknown>[] = [];

  if (preExecutedStudentResult) {
    studentCols = preExecutedStudentResult.columns.slice().sort();
    studentRowCount = preExecutedStudentResult.rowCount;
    studentRows = preExecutedStudentResult.rows;
  } else {
    if (!studentQuery?.trim()) {
      return {
        isCorrect: false,
        feedback: "No student query provided.",
        expectedColumns: expectedCols,
        expectedRowCount,
      };
    }

    const studentResult = await executeSandboxQuery(
      studentQuery.trim(),
      sandboxSchema
    );

    if (!studentResult.success) {
      return {
        isCorrect: false,
        feedback: studentResult.error.message,
        expectedColumns: expectedCols,
        expectedRowCount,
      };
    }

    studentCols = studentResult.data.columns.slice().sort();
    studentRowCount = studentResult.data.rowCount;
    studentRows = studentResult.data.rows;
  }

  const colsMatch =
    studentCols.length === expectedCols.length &&
    studentCols.every((col, i) => col === expectedCols[i]);

  if (!colsMatch) {
    const missing = expectedCols.filter((c) => !studentCols.includes(c));
    const extra = studentCols.filter((c) => !expectedCols.includes(c));

    let feedback = "Column names don't match the expected output.";
    if (missing.length > 0) feedback += ` Missing: ${missing.join(", ")}.`;
    if (extra.length > 0) feedback += ` Unexpected: ${extra.join(", ")}.`;
    feedback += " Check your column aliases (AS keyword).";

    return {
      isCorrect: false,
      feedback,
      expectedColumns: expectedCols,
      studentColumns: studentCols,
      expectedRowCount,
      studentRowCount,
    };
  }

  if (studentRowCount !== expectedRowCount) {
    let feedback = `Wrong number of rows. Expected ${expectedRowCount}, got ${studentRowCount}.`;
    if (studentRowCount > expectedRowCount)
      feedback += " You may be missing a filter (WHERE/HAVING) or returning duplicates.";
    else if (studentRowCount === 0)
      feedback += " Your query returned no rows — check your JOIN conditions.";
    else
      feedback += " You may have filtered out too many rows.";

    return {
      isCorrect: false,
      feedback,
      expectedColumns: expectedCols,
      studentColumns: studentCols,
      expectedRowCount,
      studentRowCount,
    };
  }

  const normalize = (row: Record<string, unknown>, cols: string[]): string => {
    const out: Record<string, unknown> = {};
    cols.forEach((col) => {
      const val = row[col];
      if (val === null || val === undefined) {
        out[col] = null;
      } else if (val instanceof Date) {
        out[col] = val.toISOString().slice(0, 10);
      } else if (
        typeof val === "number" ||
        (typeof val === "string" && val.trim() !== "" && !isNaN(Number(val)))
      ) {
        out[col] = Math.round(Number(val) * 10000) / 10000;
      } else {
        out[col] = String(val).trim().toLowerCase();
      }
    });
    return JSON.stringify(out);
  };

  const solutionSet = new Set(
    solutionResult.data.rows.map((r) => normalize(r, expectedCols))
  );

  const studentSet = new Set(
    studentRows.map((r) => normalize(r, expectedCols))
  );

  const mismatched: string[] = [];

  for (const row of solutionSet) {
    if (!studentSet.has(row)) mismatched.push(row);
  }

  if (mismatched.length > 0) {
    return {
      isCorrect: false,
      feedback:
        "Row count and columns match, but some values are incorrect. " +
        "Check your calculations, GROUP BY expressions, and filter conditions.",
      expectedColumns: expectedCols,
      studentColumns: studentCols,
      expectedRowCount,
      studentRowCount,
      mismatchedRows: mismatched.slice(0, 5),
    };
  }

  return {
    isCorrect: true,
    feedback: "Correct! Your query matches the expected output.",
    expectedColumns: expectedCols,
    studentColumns: studentCols,
    expectedRowCount,
    studentRowCount,
  };
}
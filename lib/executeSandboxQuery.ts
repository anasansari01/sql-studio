import { Pool } from "pg";

const sandboxPool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  statement_timeout: 5000,
  query_timeout: 5000,
  connectionTimeoutMillis: 3000,
});

export interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  executionTimeMs: number;
}

export interface QueryError {
  message: string;
  detail?: string;
  hint?: string;
}

export type ExecuteResult =
  | { success: true; data: QueryResult }
  | { success: false; error: QueryError };

export async function executeSandboxQuery(
  sql: string,
  sandboxSchema: string
): Promise<ExecuteResult> {
  const client = await sandboxPool.connect();
  const start = Date.now();

  try {
    await client.query(
      `SET search_path TO ${sandboxSchema}, public`
    );

    const result = await client.query(sql);
    const executionTimeMs = Date.now() - start;

    const columns = result.fields.map((f) => f.name);
    const rows = result.rows;

    const limitedRows = rows.slice(0, 200);

    return {
      success: true,
      data: {
        columns,
        rows: limitedRows,
        rowCount: result.rowCount ?? rows.length,
        executionTimeMs,
      },
    };
  } catch (err: unknown) {
    const pgErr = err as {
      message?: string;
      detail?: string;
      hint?: string;
    };
    return {
      success: false,
      error: {
        message: pgErr.message ?? "Query execution failed.",
        detail: pgErr.detail,
        hint: pgErr.hint,
      },
    };
  } finally {
    await client.query("SET search_path TO public").catch(() => {});
    client.release();
  }
}
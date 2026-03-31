export type Difficulty = "easy" | "medium" | "hard";
export type ResultStatus = "success" | "error" | "empty";

export interface Assignment {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  question: string;
  sandboxSchema: string;
  tables: string[];
  expectedColumns: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
}

export interface TableInfo {
  tableName: string;
  columns: ColumnInfo[];
  sampleRows: Record<string, unknown>[];
}

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

export interface Attempt {
  id: string;
  userId: string | null;
  assignmentId: string;
  sqlQuery: string;
  status: ResultStatus;
  rowCount: number;
  errorMessage: string | null;
  executionTimeMs: number | null;
  createdAt: string;
}
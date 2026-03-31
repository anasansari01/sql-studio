import { useState, useCallback } from "react";

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

export interface ValidationInfo {
  isCorrect: boolean;
  feedback: string;
  expectedColumns?: string[];
  studentColumns?: string[];
  expectedRowCount?: number;
  studentRowCount?: number;
}

interface UseExecuteQueryReturn {
  result: QueryResult | null;
  error: QueryError | null;
  validation: ValidationInfo | null;
  isLoading: boolean;
  solved: boolean;
  execute: (assignmentId: string, query: string) => Promise<void>;
  reset: () => void;
}

export function useExecuteQuery(): UseExecuteQueryReturn {
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<QueryError | null>(null);
  const [validation, setValidation] = useState<ValidationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [solved, setSolved] = useState(false);

  const execute = useCallback(
    async (assignmentId: string, query: string) => {
      if (!query.trim()) return;

      setIsLoading(true);
      setResult(null);
      setError(null);
      setValidation(null);

      try {
        const res = await fetch("/api/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assignmentId, query }),
        });

        if (res.status === 401) {
          window.location.href =
            "/login?redirect=" + encodeURIComponent(window.location.pathname);
          return;
        }

        const data = await res.json();

        if (!res.ok) {
          setError({
            message:
              typeof data.error === "string"
                ? data.error
                : data.error?.message ?? "Request failed.",
          });
          return;
        }

        if (data.error) {
          if (typeof data.error === "string") {
            setError({ message: data.error });
          } else {
            setError({
              message: data.error.message ?? "Query execution failed.",
              detail: data.error.detail,
              hint: data.error.hint,
            });
          }
          return;
        }

        if (data.result) {
          setResult(data.result);
        }

        if (data.validation) {
          setValidation(data.validation);
        }

        if (data.solved === true) {
          setSolved(true);
        }
      } catch (err) {
        setError({
          message:
            err instanceof Error
              ? err.message
              : "Network error. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setValidation(null);
    setSolved(false);
  }, []);

  return { result, error, validation, isLoading, solved, execute, reset };
}
import { useState, useCallback } from "react";

interface UseHintReturn {
  hint: string | null;
  isLoading: boolean;
  error: string | null;
  getHint: (assignmentId: string, userQuery?: string) => Promise<void>;
  clearHint: () => void;
}

export function useHint(): UseHintReturn {
  const [hint, setHint] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getHint = useCallback(
    async (assignmentId: string, userQuery: string = "") => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/hint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assignmentId, userQuery }),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          setError(data.error ?? "Failed to get hint.");
          return;
        }

        setHint(data.hint);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error.");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearHint = useCallback(() => {
    setHint(null);
    setError(null);
  }, []);

  return { hint, isLoading, error, getHint, clearHint };
}
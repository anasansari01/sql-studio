const BLOCKED_STATEMENT_STARTS = [
  "insert",
  "update",
  "delete",
  "drop",
  "alter",
  "truncate",
  "create",
  "grant",
  "revoke",
  "call",
  "execute",
  "exec",
];

const BLOCKED_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\bpg_sleep\b/i, label: "pg_sleep" },
  { pattern: /\bpg_read_file\b/i, label: "pg_read_file" },
  { pattern: /\bpg_ls_dir\b/i, label: "pg_ls_dir" },
  { pattern: /\bpg_stat_file\b/i, label: "pg_stat_file" },
  { pattern: /\bxp_cmdshell\b/i, label: "xp_cmdshell" },
  { pattern: /;.+\S/, label: "multiple statements" },
  { pattern: /\/\*/, label: "block comments" },
];

export type SanitizeResult = { ok: true } | { ok: false; reason: string };

export function sanitizeQuery(query: string): SanitizeResult {
  if (!query || typeof query !== "string") {
    return { ok: false, reason: "Query must be a non-empty string." };
  }

  const trimmed = query.trim();

  if (trimmed.length === 0) {
    return { ok: false, reason: "Query cannot be empty." };
  }

  if (trimmed.length > 5000) {
    return { ok: false, reason: "Query is too long (max 5000 characters)." };
  }

  const strippedComments = trimmed.replace(/--[^\n]*/g, "").trim();

  const lower = strippedComments.toLowerCase();

  if (!lower.startsWith("select") && !lower.startsWith("with")) {
    return {
      ok: false,
      reason:
        "Only SELECT queries are allowed. Your query must start with SELECT (or WITH for CTEs).",
    };
  }

  for (const kw of BLOCKED_STATEMENT_STARTS) {
    const wordBoundary = new RegExp(`\\b${kw}\\b`, "i");
    if (wordBoundary.test(lower)) {
      return {
        ok: false,
        reason: `Disallowed keyword detected: "${kw.toUpperCase()}". Only read-only SELECT queries are permitted.`,
      };
    }
  }

  for (const { pattern, label } of BLOCKED_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        ok: false,
        reason: `Disallowed pattern detected: "${label}". Only read-only SELECT queries are permitted.`,
      };
    }
  }

  return { ok: true };
}
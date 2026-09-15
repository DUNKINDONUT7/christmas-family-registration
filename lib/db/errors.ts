/**
 * Drizzle wraps the underlying postgres.js error in a DrizzleQueryError
 * whose own `.message` is just "Failed query: <sql>" — the real Postgres
 * error (SQLSTATE code, constraint name) lives on `.cause`. Matching on
 * the outer message/constraint fields directly silently never matches.
 */
export function isUniqueConstraintViolation(error: unknown, constraintName: string): boolean {
  const cause = (error as { cause?: unknown })?.cause as
    | { code?: string; constraint_name?: string }
    | undefined
  return cause?.code === "23505" && cause?.constraint_name === constraintName
}

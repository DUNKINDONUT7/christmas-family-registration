/**
 * Only ever redirect to a path on this site. A path starting with "//"
 * is protocol-relative and would send the browser to an external host,
 * so it's rejected along with anything else that isn't a plain "/..." path.
 */
export function safeRedirectPath(candidate: string | undefined | null, fallback: string): string {
  return candidate && /^\/(?!\/)/.test(candidate) ? candidate : fallback
}

import { ZodError } from "zod"

export type ActionResult<T = undefined> =
  | { success: true; message?: string; data?: T }
  | { success: false; message: string; fieldErrors?: Record<string, string> }

export function zodErrorToFieldErrors(error: ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form"
    if (!fieldErrors[key]) fieldErrors[key] = issue.message
  }
  return fieldErrors
}

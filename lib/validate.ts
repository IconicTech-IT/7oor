import type { Schema } from "yup";
import type { ZodType } from "zod";

export class ValidationError extends Error {}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

/**
 * Defense-in-depth: Formik+Yup already validates client-side for UX, but a Server
 * Action can be called directly regardless of the UI, so the server never trusts that
 * alone. Running the SAME raw input through two independently-implemented schema
 * libraries — both must agree it's valid — means a bug or omission in one library's
 * rules can't by itself let malformed data through.
 */
export async function validateBoth<T>(
  yupSchema: Schema<T>,
  zodSchema: ZodType<T>,
  input: unknown,
): Promise<T> {
  const zodResult = zodSchema.safeParse(input);
  if (!zodResult.success) {
    throw new ValidationError(zodResult.error.issues[0]?.message ?? "Invalid input");
  }

  try {
    return await yupSchema.validate(input, { stripUnknown: true, abortEarly: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid input";
    throw new ValidationError(message);
  }
}

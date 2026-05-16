import type { ZodError, ZodSchema } from 'zod'

import { Result } from '../result'

/**
 * Parses an unknown value with Zod and returns a typed `Result`.
 *
 * @param schema Zod schema used for validation.
 * @param value Unknown value to parse.
 * @example
 * const parsed = fromZod(UserSchema, raw)
 */
export function fromZod<T>(schema: ZodSchema<T>, value: unknown): Result<T, ZodError> {
  const parsed = schema.safeParse(value)

  return parsed.success ? Result.Ok(parsed.data) : Result.Error(parsed.error)
}

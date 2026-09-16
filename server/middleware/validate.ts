import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';

type Target = 'body' | 'query' | 'params';

/** Validate request data against a Zod schema */
export function validate(schema: ZodSchema, target: Target = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      res.status(400).json({ error: 'Validation failed', details: errors });
      return;
    }
    // Replace raw input with parsed/sanitized data
    (req as Request & { [key: string]: unknown })[target] = result.data;
    next();
  };
}

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { BadRequestError } from '../utils/app-error';

export const validate = (schema: ZodSchema) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed: any = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (parsed.body !== undefined) {
        req.body = parsed.body;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues: any[] = (error as any).issues || (error as any).errors || [];
        const firstIssue = issues[0];
        const errorMessage = firstIssue ? firstIssue.message : 'Validation failed';
        next(new BadRequestError(errorMessage));
      } else {
        next(error);
      }
    }
  };
};

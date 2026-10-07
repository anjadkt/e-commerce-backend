import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    slug: z.string().min(2).max(120).optional(),
    description: z.string().max(500).optional(),
    parent: z.string().regex(objectIdRegex, 'Invalid parent category ID').nullable().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid category ID'),
  }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    slug: z.string().min(2).max(120).optional(),
    description: z.string().max(500).optional(),
    parent: z.string().regex(objectIdRegex, 'Invalid parent category ID').nullable().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const categoryIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid category ID'),
  }),
});

export const categoryQuerySchema = z.object({
  query: z.object({
    parent: z.string().optional(), // 'null' or specific ID
    isActive: z.string().optional().transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
  }),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>['body'];
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>['body'];

import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    phone: z.string().optional(),
    address: z
      .object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string().optional(),
      })
      .optional(),
  }),
});

export const toggleUserStatusSchema = z.object({
  params: z.object({
    id: z.string('Invalid user ID format'),
  }),
  body: z.object({
    isActive: z.boolean({ message: 'isActive status boolean is required' }),
  }),
});

export const userQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
    limit: z.string().optional().transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10))) : 10)),
    search: z.string().optional(),
    isActive: z.string().optional().transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
export type ToggleUserStatusInput = z.infer<typeof toggleUserStatusSchema>['body'];
export type UserQueryParams = z.infer<typeof userQuerySchema>['query'];

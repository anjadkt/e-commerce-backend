import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createProductSchema = z.object({
  body: z
    .object({
      name: z.string().min(2, 'Name must be at least 2 characters').max(200),
      sku: z.string().min(2, 'SKU must be at least 2 characters').max(50),
      description: z.string().min(5, 'Description must be at least 5 characters'),
      price: z.number().nonnegative('Price cannot be negative'),
      salePrice: z.number().nonnegative('Sale price cannot be negative').optional(),
      stock: z.number().int().nonnegative('Stock must be a non-negative integer'),
      category: z.string().regex(objectIdRegex, 'Invalid category ID'),
      status: z.enum(['active', 'inactive', 'draft', 'out_of_stock']).optional(),
      images: z.array(z.string().url('Invalid image URL')).optional(),
    })
    .refine((data) => !data.salePrice || data.salePrice <= data.price, {
      message: 'Sale price cannot exceed regular price',
      path: ['salePrice'],
    }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid product ID'),
  }),
  body: z
    .object({
      name: z.string().min(2).max(200).optional(),
      sku: z.string().min(2).max(50).optional(),
      description: z.string().min(5).optional(),
      price: z.number().nonnegative().optional(),
      salePrice: z.number().nonnegative().optional(),
      stock: z.number().int().nonnegative().optional(),
      category: z.string().regex(objectIdRegex, 'Invalid category ID').optional(),
      status: z.enum(['active', 'inactive', 'draft', 'out_of_stock']).optional(),
      images: z.array(z.string().url()).optional(),
    })
    .refine(
      (data) => {
        if (data.price !== undefined && data.salePrice !== undefined) {
          return data.salePrice <= data.price;
        }
        return true;
      },
      {
        message: 'Sale price cannot exceed regular price',
        path: ['salePrice'],
      }
    ),
});

export const productIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid product ID'),
  }),
});

export const productQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
    limit: z.string().optional().transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10))) : 10)),
    search: z.string().optional(),
    category: z.string().regex(objectIdRegex, 'Invalid category ID').optional(),
    minPrice: z.string().optional().transform((val) => (val !== undefined ? parseFloat(val) : undefined)),
    maxPrice: z.string().optional().transform((val) => (val !== undefined ? parseFloat(val) : undefined)),
    sortBy: z.enum(['price', 'createdAt', 'name']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    status: z.enum(['active', 'inactive', 'draft', 'out_of_stock']).optional(),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
export type ProductQueryParams = z.infer<typeof productQuerySchema>['query'];

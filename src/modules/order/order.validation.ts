import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const orderItemInputSchema = z.object({
  productId: z.string().regex(objectIdRegex, 'Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be an integer greater than 0'),
});

export const shippingAddressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
});

export const createOrderSchema = z.object({
  body: z.object({
    items: z
      .array(orderItemInputSchema)
      .min(1, 'Order must contain at least one item'),
    shippingAddress: shippingAddressSchema.optional(),
    paymentMethod: z.string().optional().default('credit_card'),
    notes: z.string().optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid order ID'),
  }),
  body: z.object({
    status: z.enum([
      'Pending',
      'Confirmed',
      'Processing',
      'Shipped',
      'Delivered',
      'Cancelled',
    ]),
  }),
});

export const orderIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid order ID'),
  }),
});

export const orderQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
    limit: z.string().optional().transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10))) : 10)),
    status: z
      .enum(['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'])
      .optional(),
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>['body'];
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>['body'];
export type OrderQueryParams = z.infer<typeof orderQuerySchema>['query'];

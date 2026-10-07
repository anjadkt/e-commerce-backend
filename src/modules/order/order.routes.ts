import { Router } from 'express';
import { OrderController } from './order.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/authorize.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  orderIdParamSchema,
  orderQuerySchema,
} from './order.validation';

const router = Router();

// Customer routes (authenticated)
router.post('/', authenticate, validate(createOrderSchema), OrderController.createOrder);
router.get('/my-orders', authenticate, validate(orderQuerySchema), OrderController.getCustomerOrders);
router.get('/:id', authenticate, validate(orderIdParamSchema), OrderController.getOrderById);

// Admin-only order management routes
router.get('/', authenticate, authorize('admin'), validate(orderQuerySchema), OrderController.getAllOrders);
router.patch(
  '/:id/status',
  authenticate,
  authorize('admin'),
  validate(updateOrderStatusSchema),
  OrderController.updateOrderStatus
);

export const orderRoutes = router;

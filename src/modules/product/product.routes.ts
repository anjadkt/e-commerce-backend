import { Router } from 'express';
import { ProductController } from './product.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/authorize.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createProductSchema,
  updateProductSchema,
  productIdParamSchema,
  productQuerySchema,
} from './product.validation';

const router = Router();

// Public customer routes (can browse without logging in)
router.get('/', validate(productQuerySchema), ProductController.getProducts);
router.get('/:id', validate(productIdParamSchema), ProductController.getProductById);

// Admin-only product management routes
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate(createProductSchema),
  ProductController.createProduct
);

router.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(updateProductSchema),
  ProductController.updateProduct
);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(updateProductSchema),
  ProductController.updateProduct
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(productIdParamSchema),
  ProductController.deleteProduct
);

export const productRoutes = router;

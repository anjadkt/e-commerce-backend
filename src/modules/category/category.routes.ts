import { Router } from 'express';
import { CategoryController } from './category.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
  categoryQuerySchema,
} from './category.validation';

const router = Router();

// Public routes
router.get('/tree', CategoryController.getCategoryTree);
router.get('/', validate(categoryQuerySchema), CategoryController.getAllCategories);
router.get('/:id', validate(categoryIdParamSchema), CategoryController.getCategoryById);

// Admin-only management routes
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate(createCategorySchema),
  CategoryController.createCategory
);

router.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(updateCategorySchema),
  CategoryController.updateCategory
);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(updateCategorySchema),
  CategoryController.updateCategory
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(categoryIdParamSchema),
  CategoryController.deleteCategory
);

export const categoryRoutes = router;

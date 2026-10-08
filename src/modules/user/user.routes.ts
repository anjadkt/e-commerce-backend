import { Router } from 'express';
import { UserController } from './user.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/authorize.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  updateProfileSchema,
  toggleUserStatusSchema,
  userQuerySchema,
} from './user.validation';

const router = Router();

// Customer & Admin self routes
router.get('/profile', authenticate, UserController.getProfile);
router.patch('/profile', authenticate, validate(updateProfileSchema), UserController.updateProfile);

// Admin-only user management routes
router.get('/', authenticate, authorize('admin'), validate(userQuerySchema), UserController.getAllUsers);
router.get('/:id', authenticate, authorize('admin'), UserController.getUserById);
router.patch('/:id/status', authenticate, authorize('admin'), validate(toggleUserStatusSchema), UserController.toggleStatus );

export const userRoutes = router;

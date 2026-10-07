import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { registerSchema, loginSchema } from './auth.validation';

const router = Router();

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/refresh', AuthController.refreshToken);
router.post('/logout', AuthController.logout);
router.get('/me', authenticate, AuthController.getMe);

export const authRoutes = router;

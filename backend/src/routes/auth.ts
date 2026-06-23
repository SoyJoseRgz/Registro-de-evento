import { Router } from 'express';
import { login, register, refreshToken, me } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { loginSchema, registerSchema, refreshSchema } from '../validations/auth.schema';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/register', authenticate, validate(registerSchema), register);
router.post('/refresh', validate(refreshSchema), refreshToken);
router.get('/me', authenticate, me);

export default router;
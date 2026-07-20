import { Router } from 'express';
import { getMe, completeOnboarding } from './user.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

router.get('/me', requireAuth, getMe);
router.post('/onboarding', requireAuth, completeOnboarding);

export default router;

import { Router } from 'express';
import { googleAuth, googleCallback, refresh, logout } from './auth.controller';

const router = Router();

router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;

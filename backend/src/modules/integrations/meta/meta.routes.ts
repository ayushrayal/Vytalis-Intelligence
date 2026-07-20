import { Router } from 'express';
import { connectMeta, metaCallback, getMetaStatus, getAdAccounts } from './meta.controller';
import { requireAuth } from '../../../middleware/auth.middleware';

const router = Router();

router.get('/connect', requireAuth, connectMeta);
router.get('/callback', metaCallback);
router.get('/status', requireAuth, getMetaStatus);
router.get('/ad-accounts', requireAuth, getAdAccounts);

export default router;

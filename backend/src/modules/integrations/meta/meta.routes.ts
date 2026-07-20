import { Router } from 'express';
import {
  connectMeta,
  metaCallback,
  getAdAccounts,
  selectAdAccount,
  getMetaStatus,
  getMetaInsights,
} from './meta.controller';
import { requireAuth } from '../../../middleware/auth.middleware';

const router = Router();

router.get('/connect', requireAuth, connectMeta);
router.get('/callback', metaCallback);
router.get('/accounts', requireAuth, getAdAccounts);
router.post('/select-account', requireAuth, selectAdAccount);
router.get('/status', requireAuth, getMetaStatus);
router.get('/insights', requireAuth, getMetaInsights);

export default router;

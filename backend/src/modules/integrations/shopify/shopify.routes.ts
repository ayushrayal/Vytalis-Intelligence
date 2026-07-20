import { Router } from 'express';
import { connectShopify, shopifyCallback, getShopifyStatus, getShopDetails } from './shopify.controller';
import { requireAuth } from '../../../middleware/auth.middleware';

const router = Router();

router.get('/connect', requireAuth, connectShopify);
router.get('/callback', shopifyCallback);
router.get('/status', requireAuth, getShopifyStatus);
router.get('/store', requireAuth, getShopDetails);

export default router;

import { Router } from 'express';
import {
  connectShopify,
  shopifyCallback,
  getShopifyStatus,
  getShopDetails,
  getShopifyOrders,
  getShopifyProducts,
  disconnectShopify,
} from './shopify.controller';
import { requireAuth } from '../../../middleware/auth.middleware';

const router = Router();

router.get('/connect', requireAuth, connectShopify);
router.get('/callback', shopifyCallback);
router.get('/status', requireAuth, getShopifyStatus);
router.get('/store', requireAuth, getShopDetails);
router.get('/orders', requireAuth, getShopifyOrders);
router.get('/products', requireAuth, getShopifyProducts);
router.post('/disconnect', requireAuth, disconnectShopify);

export default router;

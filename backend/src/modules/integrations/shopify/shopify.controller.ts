import { Request, Response } from 'express';
import { shopifyService } from './shopify.service';
import { asyncHandler } from '../../../shared/utils/async-handler';
import { UnauthorizedError, BadRequestError } from '../../../shared/errors/app-error';
import { env } from '../../../config/env.config';
import { validateAndConsumeShopifyOAuthState } from '../../../shared/utils/redis.util';

export const connectShopify = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new UnauthorizedError('Unauthorized');
  }
console.log("SHOPIFY_CLIENT_ID:", env.SHOPIFY_CLIENT_ID);
console.log("SHOPIFY_REDIRECT_URI:", env.SHOPIFY_REDIRECT_URI);
  const shop = (req.query.shop as string) || 'my-store.myshopify.com';
  if (!shop) {
    throw new BadRequestError('Shop domain query parameter (?shop=store.myshopify.com) is required');
  }

  const authUrl = await shopifyService.getShopifyAuthUrl(req.user.userId, shop);
  res.redirect(authUrl);
});

export const shopifyCallback = asyncHandler(async (req: Request, res: Response) => {
  const state = req.query.state as string;
  const shop = (req.query.shop as string) || 'my-store.myshopify.com';
  const code = (req.query.code as string) || 'mock_code';
  const error = req.query.error as string;

  if (error) {
    res.redirect(`${env.FRONTEND_URL}/dashboard?shopify_error=${encodeURIComponent(error)}`);
    return;
  }

  let userId = req.user?.userId;

  // Consume Redis OAuth state parameter if third-party redirect stripped session cookie
  if (!userId && state) {
    try {
      const decodedJson = Buffer.from(state, 'base64').toString('utf-8');
      const parsed = JSON.parse(decodedJson);
      if (parsed.nonce) {
        const validatedUserId = await validateAndConsumeShopifyOAuthState(parsed.nonce);
        if (validatedUserId) {
          userId = validatedUserId;
        }
      }
    } catch {
      // Ignore JSON decode error
    }
  }

  if (!userId) {
    res.redirect(`${env.FRONTEND_URL}/login?error=session_expired`);
    return;
  }

  try {
    await shopifyService.connectShopifyStore(userId, shop, code);
    res.redirect(`${env.FRONTEND_URL}/dashboard?shopify=connected`);
  } catch (err: any) {
    res.redirect(`${env.FRONTEND_URL}/dashboard?shopify_error=${encodeURIComponent(err.message || 'connection_failed')}`);
  }
});

export const getShopifyStatus = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new UnauthorizedError('Unauthorized');
  }

  const status = await shopifyService.getShopifyStatus(req.user.userId);

  res.status(200).json({
    success: true,
    data: status,
  });
});

export const getShopDetails = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new UnauthorizedError('Unauthorized');
  }

  const shop = await shopifyService.getDecryptedShopDetails(req.user.userId);

  res.status(200).json({
    success: true,
    data: shop,
  });
});

export const getShopifyOrders = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new UnauthorizedError('Unauthorized');
  }

  const metrics = await shopifyService.fetchShopifyMetrics(req.user.userId);

  res.status(200).json({
    success: true,
    data: {
      ordersCount: metrics.ordersCount,
      totalRevenue: metrics.totalRevenue,
      customersCount: metrics.customersCount,
      averageOrderValue: metrics.averageOrderValue,
      currency: metrics.currency,
      lastSyncedAt: metrics.lastSyncedAt,
    },
  });
});

export const getShopifyProducts = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new UnauthorizedError('Unauthorized');
  }

  const metrics = await shopifyService.fetchShopifyMetrics(req.user.userId);

  res.status(200).json({
    success: true,
    data: {
      productsCount: metrics.productsCount,
      lastSyncedAt: metrics.lastSyncedAt,
    },
  });
});

export const disconnectShopify = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new UnauthorizedError('Unauthorized');
  }

  await shopifyService.disconnectShopifyStore(req.user.userId);

  res.status(200).json({
    success: true,
    message: 'Shopify store disconnected successfully',
  });
});

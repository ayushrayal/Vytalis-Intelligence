import { Request, Response } from 'express';
import { shopifyService } from './shopify.service';
import { asyncHandler } from '../../../shared/utils/async-handler';
import { UnauthorizedError, BadRequestError } from '../../../shared/errors/app-error';
import { env } from '../../../config/env.config';
import { verifyAccessToken } from '../../../shared/utils/jwt.util';
import { COOKIE_KEYS } from '../../../shared/constants';

export const connectShopify = asyncHandler(async (req: Request, res: Response) => {
  const shop = (req.query.shop as string) || 'my-store.myshopify.com';
  if (!shop) {
    throw new BadRequestError('Shop domain query parameter (?shop=store.myshopify.com) is required');
  }

  const authUrl = shopifyService.getShopifyAuthUrl(shop);
  res.redirect(authUrl);
});

export const shopifyCallback = asyncHandler(async (req: Request, res: Response) => {
  const shop = (req.query.shop as string) || 'my-store.myshopify.com';
  const code = (req.query.code as string) || 'mock_code';
  const error = req.query.error as string;

  if (error) {
    res.redirect(`${env.FRONTEND_URL}/dashboard?shopify_error=${encodeURIComponent(error)}`);
    return;
  }

  let userId = req.user?.userId;
  if (!userId) {
    const tokenCookie = req.cookies[COOKIE_KEYS.ACCESS_TOKEN];
    if (tokenCookie) {
      try {
        const payload = verifyAccessToken(tokenCookie);
        userId = payload.userId;
      } catch {
        // Token invalid or expired
      }
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
    connected: status.connected,
    shopDomain: status.shopDomain,
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

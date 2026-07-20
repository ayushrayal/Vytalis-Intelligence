import { Request, Response } from 'express';
import { metaService } from './meta.service';
import { asyncHandler } from '../../../shared/utils/async-handler';
import { UnauthorizedError, BadRequestError } from '../../../shared/errors/app-error';
import { env } from '../../../config/env.config';
import { validateAndConsumeMetaOAuthState } from '../../../shared/utils/redis.util';

export const connectMeta = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new UnauthorizedError('Unauthorized');
  }

  const authUrl = await metaService.getMetaAuthUrl(req.user.userId);
  res.redirect(authUrl);
});

export const metaCallback = asyncHandler(async (req: Request, res: Response) => {
  const code = (req.query.code as string) || 'mock_code';
  const error = req.query.error as string;
  const state = req.query.state as string;

  console.log('[META] Callback Hit');

  if (error) {
    console.log('[META ERROR] OAuth error returned from Meta:', error);
    res.redirect(`${env.FRONTEND_URL}/dashboard?meta_error=${encodeURIComponent(error)}`);
    return;
  }

  // 1. Check state parameter exists
  if (!state) {
    console.log('[META ERROR] Missing OAuth state.');
    throw new BadRequestError('Invalid Meta OAuth state.');
  }

  let payload: { userId?: string; nonce?: string; timestamp?: number };

  // 2 & 3. Check state is valid Base64 and JSON parse succeeds
  try {
    const decodedStr = Buffer.from(state, 'base64').toString('utf-8');
    payload = JSON.parse(decodedStr);
  } catch {
    console.log('[META ERROR] Invalid Base64 or JSON state format.');
    throw new BadRequestError('Invalid Meta OAuth state.');
  }

  // 4 & 5. Check userId and nonce exist
  if (!payload || !payload.userId || !payload.nonce) {
    console.log('[META ERROR] Invalid OAuth state payload: missing userId or nonce.');
    throw new BadRequestError('Invalid Meta OAuth state.');
  }

  // 6. Check timestamp is not older than 5 minutes (300,000 ms)
  const isExpired = !payload.timestamp || Date.now() - payload.timestamp > 300000;
  if (isExpired) {
    console.log('[META ERROR] OAuth state expired (older than 5 minutes).');
    throw new BadRequestError('Invalid Meta OAuth state.');
  }

  // 7. Validate and consume state from Redis
  const redisUserId = await validateAndConsumeMetaOAuthState(payload.nonce);
  if (!redisUserId || redisUserId !== payload.userId) {
    console.log('[META ERROR] OAuth state Redis validation failed or already consumed.');
    throw new BadRequestError('Invalid Meta OAuth state.');
  }

  const userId = payload.userId;

  console.log('[META] State:', state);
  console.log('[META] User ID:', userId);
  console.log('[META] Callback Success');

  try {
    await metaService.connectMetaAccount(userId, code);
    res.redirect(`${env.FRONTEND_URL}/dashboard?meta=oauth_complete`);
  } catch (err: any) {
    console.log('[META ERROR] Connection failed during token processing:', err.message);
    res.redirect(`${env.FRONTEND_URL}/dashboard?meta_error=${encodeURIComponent(err.message || 'connection_failed')}`);
  }
});

export const getAdAccounts = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new UnauthorizedError('Unauthorized');
  }

  const accounts = await metaService.getAdAccountsForUser(req.user.userId);

  res.status(200).json({
    success: true,
    data: accounts,
  });
});

export const selectAdAccount = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new UnauthorizedError('Unauthorized');
  }

  const { adAccountId, adAccountName } = req.body;
  if (!adAccountId || !adAccountName) {
    throw new BadRequestError('adAccountId and adAccountName are required');
  }

  const user = await metaService.selectAdAccount(req.user.userId, adAccountId, adAccountName);

  res.status(200).json({
    success: true,
    message: 'Ad account selected successfully',
    data: {
      adAccountId: user.meta?.adAccountId,
      adAccountName: user.meta?.adAccountName,
      connected: user.meta?.connected,
    },
  });
});

export const getMetaStatus = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new UnauthorizedError('Unauthorized');
  }

  const status = await metaService.getMetaStatus(req.user.userId);

  res.status(200).json({
    success: true,
    data: status,
  });
});

export const getMetaInsights = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new UnauthorizedError('Unauthorized');
  }

  const insights = await metaService.getInsights(req.user.userId);

  res.status(200).json({
    success: true,
    data: insights,
  });
});

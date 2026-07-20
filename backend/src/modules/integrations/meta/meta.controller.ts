import { Request, Response } from 'express';
import { metaService } from './meta.service';
import { asyncHandler } from '../../../shared/utils/async-handler';
import { UnauthorizedError } from '../../../shared/errors/app-error';
import { env } from '../../../config/env.config';
import { verifyAccessToken } from '../../../shared/utils/jwt.util';
import { COOKIE_KEYS } from '../../../shared/constants';

export const connectMeta = asyncHandler(async (_req: Request, res: Response) => {
  const authUrl = metaService.getMetaAuthUrl();
  res.redirect(authUrl);
});

export const metaCallback = asyncHandler(async (req: Request, res: Response) => {
  const code = (req.query.code as string) || 'mock_code';
  const error = req.query.error as string;

  if (error) {
    res.redirect(`${env.FRONTEND_URL}/dashboard?meta_error=${encodeURIComponent(error)}`);
    return;
  }

  // Retrieve user ID from authorization header, req.user, or access token cookie
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
    await metaService.connectMetaAccount(userId, code);
    res.redirect(`${env.FRONTEND_URL}/dashboard?meta=connected`);
  } catch (err: any) {
    res.redirect(`${env.FRONTEND_URL}/dashboard?meta_error=${encodeURIComponent(err.message || 'connection_failed')}`);
  }
});

export const getMetaStatus = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new UnauthorizedError('Unauthorized');
  }

  const status = await metaService.getMetaStatus(req.user.userId);

  res.status(200).json({
    connected: status.connected,
    adAccounts: status.adAccounts,
  });
});

export const getAdAccounts = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.userId) {
    throw new UnauthorizedError('Unauthorized');
  }

  const adAccounts = await metaService.getDecryptedAdAccounts(req.user.userId);

  res.status(200).json({
    success: true,
    data: {
      adAccounts,
    },
  });
});

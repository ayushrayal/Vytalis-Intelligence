import { Request, Response } from 'express';
import { authService } from './auth.service';
import { setAuthCookies, clearAuthCookies } from '../../shared/utils/cookie.util';
import { COOKIE_KEYS } from '../../shared/constants';
import { env } from '../../config/env.config';
import { asyncHandler } from '../../shared/utils/async-handler';
import { UnauthorizedError } from '../../shared/errors/app-error';

export const googleAuth = asyncHandler(async (_req: Request, res: Response) => {
  const url = authService.getGoogleAuthUrl();
  res.redirect(url);
});

export const googleCallback = asyncHandler(async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const error = req.query.error as string;

  if (error || !code) {
    res.redirect(`${env.FRONTEND_URL}/login?error=${encodeURIComponent(error || 'authentication_cancelled')}`);
    return;
  }

  try {
    const { user, accessToken, refreshToken } = await authService.handleGoogleCallback(code);

    setAuthCookies(res, accessToken, refreshToken);

    const redirectPath = user.isOnboarded ? '/dashboard' : '/welcome';

    console.log('FRONTEND_URL:', env.FRONTEND_URL);
    console.log('Redirecting to:', `${env.FRONTEND_URL}${redirectPath}`);

    res.redirect(`${env.FRONTEND_URL}${redirectPath}`);
  } catch (err) {
    res.redirect(`${env.FRONTEND_URL}/login?error=auth_failed`);
  }
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken =
    req.cookies[COOKIE_KEYS.REFRESH_TOKEN] ||
    req.body?.refreshToken ||
    req.headers['x-refresh-token'];

  if (!refreshToken || typeof refreshToken !== 'string') {
    clearAuthCookies(res);
    throw new UnauthorizedError('Refresh token missing');
  }

  try {
    const { accessToken, refreshToken: newRefreshToken } = await authService.refreshSession(refreshToken);

    setAuthCookies(res, accessToken, newRefreshToken);

    res.status(200).json({
      success: true,
      data: {
        accessToken,
      },
    });
  } catch (error) {
    clearAuthCookies(res);
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (req.user?.userId) {
    await authService.logout(req.user.userId);
  }

  clearAuthCookies(res);

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

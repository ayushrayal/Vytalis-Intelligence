import { Response } from 'express';
import { env } from '../../config/env.config';
import { COOKIE_KEYS, TOKEN_EXPIRY } from '../constants';

export const setAuthCookies = (res: Response, accessToken: string, refreshToken: string): void => {
  const isProd = env.NODE_ENV === 'production';

  res.cookie(COOKIE_KEYS.ACCESS_TOKEN, accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: TOKEN_EXPIRY.ACCESS_TOKEN_MS,
    path: '/',
  });

  res.cookie(COOKIE_KEYS.REFRESH_TOKEN, refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: TOKEN_EXPIRY.REFRESH_TOKEN_MS,
    path: '/',
  });
};

export const clearAuthCookies = (res: Response): void => {
  const isProd = env.NODE_ENV === 'production';

  res.clearCookie(COOKIE_KEYS.ACCESS_TOKEN, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    path: '/',
  });

  res.clearCookie(COOKIE_KEYS.REFRESH_TOKEN, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    path: '/',
  });
};

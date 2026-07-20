import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../shared/errors/app-error';
import { verifyAccessToken } from '../shared/utils/jwt.util';
import { COOKIE_KEYS } from '../shared/constants';

export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const token = req.cookies[COOKIE_KEYS.ACCESS_TOKEN] || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedError('Authentication token missing');
    }

    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired authentication token'));
  }
};

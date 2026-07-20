import jwt from 'jsonwebtoken';
import { env } from '../../config/env.config';
import { TOKEN_EXPIRY } from '../constants';

export interface JwtAccessTokenPayload {
  userId: string;
  email: string;
  plan: 'starter' | 'growth' | 'agency';
}

export interface JwtRefreshTokenPayload {
  userId: string;
  tokenId: string;
}

export const generateAccessToken = (payload: JwtAccessTokenPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: TOKEN_EXPIRY.ACCESS_TOKEN_JWT,
  });
};

export const generateRefreshToken = (payload: JwtRefreshTokenPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: TOKEN_EXPIRY.REFRESH_TOKEN_JWT,
  });
};

export const signAccessToken = generateAccessToken;
export const signRefreshToken = generateRefreshToken;

export const verifyAccessToken = (token: string): JwtAccessTokenPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtAccessTokenPayload;
};

export const verifyRefreshToken = (token: string): JwtRefreshTokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtRefreshTokenPayload;
};


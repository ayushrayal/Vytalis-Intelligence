import crypto from 'crypto';
import { getRedisClient } from '../../config/redis.config';
import { logger } from '../../config/logger.config';

const REFRESH_TOKEN_TTL_SECONDS = 604800; // 7 Days

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const storeRefreshTokenHash = async (userId: string, refreshToken: string): Promise<void> => {
  try {
    const client = getRedisClient();
    const tokenHash = hashToken(refreshToken);
    const key = `refresh:${userId}`;
    const data = JSON.stringify({ tokenHash });

    await client.set(key, data, 'EX', REFRESH_TOKEN_TTL_SECONDS);
  } catch (error) {
    logger.error(`Failed to store refresh token hash in Redis for user ${userId}`, { error });
  }
};

export const getRefreshTokenHash = async (userId: string): Promise<string | null> => {
  try {
    const client = getRedisClient();
    const key = `refresh:${userId}`;
    const data = await client.get(key);

    if (!data) return null;

    const parsed = JSON.parse(data);
    return parsed.tokenHash || null;
  } catch (error) {
    logger.error(`Failed to retrieve refresh token hash from Redis for user ${userId}`, { error });
    return null;
  }
};

export const deleteRefreshToken = async (userId: string): Promise<void> => {
  try {
    const client = getRedisClient();
    const key = `refresh:${userId}`;
    await client.del(key);
  } catch (error) {
    logger.error(`Failed to delete refresh token from Redis for user ${userId}`, { error });
  }
};

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

export const META_INSIGHTS_CACHE_TTL_SECONDS = 900; // 15 Minutes

export const storeMetaInsightsCache = async (userId: string, data: any): Promise<void> => {
  try {
    const client = getRedisClient();
    const key = `meta:insights:${userId}`;
    await client.set(key, JSON.stringify(data), 'EX', META_INSIGHTS_CACHE_TTL_SECONDS);
  } catch (error) {
    logger.error(`Failed to store Meta insights in Redis cache for user ${userId}`, { error });
  }
};

export const getMetaInsightsCache = async (userId: string): Promise<any | null> => {
  try {
    const client = getRedisClient();
    const key = `meta:insights:${userId}`;
    const data = await client.get(key);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    logger.error(`Failed to retrieve Meta insights from Redis cache for user ${userId}`, { error });
    return null;
  }
};

export const META_OAUTH_STATE_TTL_SECONDS = 300; // 5 Minutes

export const storeMetaOAuthState = async (nonce: string, userId: string): Promise<void> => {
  try {
    const client = getRedisClient();
    const key = `oauth:meta:${nonce}`;
    await client.set(key, JSON.stringify({ userId }), 'EX', META_OAUTH_STATE_TTL_SECONDS);
  } catch (error) {
    logger.error(`Failed to store Meta OAuth state in Redis for nonce ${nonce}`, { error });
  }
};

export const validateAndConsumeMetaOAuthState = async (nonce: string): Promise<string | null> => {
  try {
    const client = getRedisClient();
    const key = `oauth:meta:${nonce}`;
    const data = await client.get(key);
    if (!data) return null;
    await client.del(key);
    const parsed = JSON.parse(data);
    return parsed.userId || null;
  } catch (error) {
    logger.error(`Failed to validate Meta OAuth state in Redis for nonce ${nonce}`, { error });
    return null;
  }
};



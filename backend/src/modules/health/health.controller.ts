import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { getRedisClient } from '../../config/redis.config';
import { asyncHandler } from '../../shared/utils/async-handler';

export const getHealthStatus = asyncHandler(async (_req: Request, res: Response) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  let redisStatus = 'disconnected';
  try {
    const redis = getRedisClient();
    const ping = await redis.ping();
    if (ping === 'PONG') redisStatus = 'connected';
  } catch {
    redisStatus = 'degraded';
  }

  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      service: 'Vytalis Intelligence Backend',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      redis: redisStatus,
    },
  });
});

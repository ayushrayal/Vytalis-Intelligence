import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import http from 'http';
import app from './src/app';
import { env } from './src/config/env.config';
import { logger } from './src/config/logger.config';
import { connectDatabase, disconnectDatabase } from './src/config/database.config';
import { connectRedis, disconnectRedis } from './src/config/redis.config';

let server: http.Server;

process.on('uncaughtException', (error: Error) => {
  logger.error('CRITICAL: Uncaught Exception detected', { error });
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('CRITICAL: Unhandled Promise Rejection detected', {
    reason,
  });
  process.exit(1);
});

async function bootstrap() {
  try {
    logger.info(
      'Starting Vytalis Intelligence Backend bootstrap sequence...'
    );

    await connectDatabase();
    await connectRedis();

    server = app.listen(env.PORT, () => {
      const apiBaseUrl =
        env.NODE_ENV === 'production'
          ? `${env.BACKEND_URL}/api/v1`
          : `http://localhost:${env.PORT}/api/v1`;

      logger.info(
        `🚀 Server running on port ${env.PORT} in [${env.NODE_ENV}] mode`
      );

      logger.info(`API Base Endpoint: ${apiBaseUrl}`);
    });
  } catch (error) {
    logger.error('Failed to start server bootstrap sequence', { error });
    process.exit(1);
  }
}

async function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal}. Initiating graceful shutdown...`);

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');

      await disconnectDatabase();
      await disconnectRedis();

      logger.info(
        'Vytalis Backend process terminated gracefully.'
      );

      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

bootstrap();
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import http from 'http';
import app from './src/app';
import { env } from './src/config/env.config';
import { logger } from './src/config/logger.config';
import { connectDatabase, disconnectDatabase } from './src/config/database.config';
import { connectRedis, disconnectRedis } from './src/config/redis.config';

let server: http.Server;

// Uncaught Exception Handler
process.on('uncaughtException', (error: Error) => {
  logger.error('CRITICAL: Uncaught Exception detected', { error });
  process.exit(1);
});

// Unhandled Rejection Handler
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('CRITICAL: Unhandled Promise Rejection detected', { reason });
  process.exit(1);
});

async function bootstrap() {
  try {
    logger.info('Starting Vytalis Intelligence Backend bootstrap sequence...');

    // 1. Connect MongoDB
    await connectDatabase();

    // 2. Connect Redis
    await connectRedis();

    // 3. Start Express HTTP Server
    server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server running on port ${env.PORT} in [${env.NODE_ENV}] mode`);
      logger.info(`API Base Endpoint: http://localhost:${env.PORT}/api/v1`);
    });

  } catch (error) {
    logger.error('Failed to start server bootstrap sequence', { error });
    process.exit(1);
  }
}

// Graceful Shutdown Logic
async function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal}. Initiating graceful shutdown...`);
  
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      await disconnectDatabase();
      await disconnectRedis();
      logger.info('Vytalis Backend process terminated gracefully.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

bootstrap();

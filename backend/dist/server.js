"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dns_1 = __importDefault(require("dns"));
dns_1.default.setServers(['8.8.8.8', '8.8.4.4']);
const app_1 = __importDefault(require("./src/app"));
const env_config_1 = require("./src/config/env.config");
const logger_config_1 = require("./src/config/logger.config");
const database_config_1 = require("./src/config/database.config");
const redis_config_1 = require("./src/config/redis.config");
let server;
process.on('uncaughtException', (error) => {
    logger_config_1.logger.error('CRITICAL: Uncaught Exception detected', { error });
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    logger_config_1.logger.error('CRITICAL: Unhandled Promise Rejection detected', {
        reason,
    });
    process.exit(1);
});
async function bootstrap() {
    try {
        logger_config_1.logger.info('Starting Vytalis Intelligence Backend bootstrap sequence...');
        await (0, database_config_1.connectDatabase)();
        await (0, redis_config_1.connectRedis)();
        server = app_1.default.listen(env_config_1.env.PORT, () => {
            const apiBaseUrl = env_config_1.env.NODE_ENV === 'production'
                ? `${env_config_1.env.BACKEND_URL}/api/v1`
                : `http://localhost:${env_config_1.env.PORT}/api/v1`;
            logger_config_1.logger.info(`🚀 Server running on port ${env_config_1.env.PORT} in [${env_config_1.env.NODE_ENV}] mode`);
            logger_config_1.logger.info(`API Base Endpoint: ${apiBaseUrl}`);
        });
    }
    catch (error) {
        logger_config_1.logger.error('Failed to start server bootstrap sequence', { error });
        process.exit(1);
    }
}
async function gracefulShutdown(signal) {
    logger_config_1.logger.info(`Received ${signal}. Initiating graceful shutdown...`);
    if (server) {
        server.close(async () => {
            logger_config_1.logger.info('HTTP server closed.');
            await (0, database_config_1.disconnectDatabase)();
            await (0, redis_config_1.disconnectRedis)();
            logger_config_1.logger.info('Vytalis Backend process terminated gracefully.');
            process.exit(0);
        });
    }
    else {
        process.exit(0);
    }
}
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
bootstrap();

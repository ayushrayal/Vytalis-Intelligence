"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectRedis = exports.connectRedis = exports.getRedisClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const env_config_1 = require("./env.config");
const logger_config_1 = require("./logger.config");
let redisClient = null;
const getRedisClient = () => {
    if (!redisClient) {
        redisClient = new ioredis_1.default(env_config_1.env.REDIS_URL, {
            maxRetriesPerRequest: 3,
            retryStrategy(times) {
                const delay = Math.min(times * 100, 3000);
                return delay;
            },
            lazyConnect: true,
        });
        redisClient.on('connect', () => {
            logger_config_1.logger.info('Redis connection established');
        });
        redisClient.on('error', (err) => {
            logger_config_1.logger.warn(`Redis connection error: ${err.message}`);
        });
    }
    return redisClient;
};
exports.getRedisClient = getRedisClient;
const connectRedis = async () => {
    const client = (0, exports.getRedisClient)();
    try {
        await client.connect();
        return client;
    }
    catch (error) {
        logger_config_1.logger.warn('Redis connect failed - operating with degraded cache capability', { error });
        return client;
    }
};
exports.connectRedis = connectRedis;
const disconnectRedis = async () => {
    if (redisClient) {
        await redisClient.quit();
        logger_config_1.logger.info('Redis disconnected cleanly');
    }
};
exports.disconnectRedis = disconnectRedis;

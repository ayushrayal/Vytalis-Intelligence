"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRefreshToken = exports.getRefreshTokenHash = exports.storeRefreshTokenHash = exports.hashToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
const redis_config_1 = require("../../config/redis.config");
const logger_config_1 = require("../../config/logger.config");
const REFRESH_TOKEN_TTL_SECONDS = 604800; // 7 Days
const hashToken = (token) => {
    return crypto_1.default.createHash('sha256').update(token).digest('hex');
};
exports.hashToken = hashToken;
const storeRefreshTokenHash = async (userId, refreshToken) => {
    try {
        const client = (0, redis_config_1.getRedisClient)();
        const tokenHash = (0, exports.hashToken)(refreshToken);
        const key = `refresh:${userId}`;
        const data = JSON.stringify({ tokenHash });
        await client.set(key, data, 'EX', REFRESH_TOKEN_TTL_SECONDS);
    }
    catch (error) {
        logger_config_1.logger.error(`Failed to store refresh token hash in Redis for user ${userId}`, { error });
    }
};
exports.storeRefreshTokenHash = storeRefreshTokenHash;
const getRefreshTokenHash = async (userId) => {
    try {
        const client = (0, redis_config_1.getRedisClient)();
        const key = `refresh:${userId}`;
        const data = await client.get(key);
        if (!data)
            return null;
        const parsed = JSON.parse(data);
        return parsed.tokenHash || null;
    }
    catch (error) {
        logger_config_1.logger.error(`Failed to retrieve refresh token hash from Redis for user ${userId}`, { error });
        return null;
    }
};
exports.getRefreshTokenHash = getRefreshTokenHash;
const deleteRefreshToken = async (userId) => {
    try {
        const client = (0, redis_config_1.getRedisClient)();
        const key = `refresh:${userId}`;
        await client.del(key);
    }
    catch (error) {
        logger_config_1.logger.error(`Failed to delete refresh token from Redis for user ${userId}`, { error });
    }
};
exports.deleteRefreshToken = deleteRefreshToken;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHealthStatus = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const redis_config_1 = require("../../config/redis.config");
const async_handler_1 = require("../../shared/utils/async-handler");
exports.getHealthStatus = (0, async_handler_1.asyncHandler)(async (_req, res) => {
    const dbStatus = mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected';
    let redisStatus = 'disconnected';
    try {
        const redis = (0, redis_config_1.getRedisClient)();
        const ping = await redis.ping();
        if (ping === 'PONG')
            redisStatus = 'connected';
    }
    catch {
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

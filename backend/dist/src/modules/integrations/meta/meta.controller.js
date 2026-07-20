"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetaInsights = exports.getMetaStatus = exports.selectAdAccount = exports.getAdAccounts = exports.metaCallback = exports.connectMeta = void 0;
const meta_service_1 = require("./meta.service");
const async_handler_1 = require("../../../shared/utils/async-handler");
const app_error_1 = require("../../../shared/errors/app-error");
const env_config_1 = require("../../../config/env.config");
const redis_util_1 = require("../../../shared/utils/redis.util");
exports.connectMeta = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.user?.userId) {
        throw new app_error_1.UnauthorizedError('Unauthorized');
    }
    const authUrl = await meta_service_1.metaService.getMetaAuthUrl(req.user.userId);
    res.redirect(authUrl);
});
exports.metaCallback = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const code = req.query.code || 'mock_code';
    const error = req.query.error;
    const state = req.query.state;
    console.log('[META] Callback Hit');
    if (error) {
        console.log('[META ERROR] OAuth error returned from Meta:', error);
        res.redirect(`${env_config_1.env.FRONTEND_URL}/dashboard?meta_error=${encodeURIComponent(error)}`);
        return;
    }
    // 1. Check state parameter exists
    if (!state) {
        console.log('[META ERROR] Missing OAuth state.');
        throw new app_error_1.BadRequestError('Invalid Meta OAuth state.');
    }
    let payload;
    // 2 & 3. Check state is valid Base64 and JSON parse succeeds
    try {
        const decodedStr = Buffer.from(state, 'base64').toString('utf-8');
        payload = JSON.parse(decodedStr);
    }
    catch {
        console.log('[META ERROR] Invalid Base64 or JSON state format.');
        throw new app_error_1.BadRequestError('Invalid Meta OAuth state.');
    }
    // 4 & 5. Check userId and nonce exist
    if (!payload || !payload.userId || !payload.nonce) {
        console.log('[META ERROR] Invalid OAuth state payload: missing userId or nonce.');
        throw new app_error_1.BadRequestError('Invalid Meta OAuth state.');
    }
    // 6. Check timestamp is not older than 5 minutes (300,000 ms)
    const isExpired = !payload.timestamp || Date.now() - payload.timestamp > 300000;
    if (isExpired) {
        console.log('[META ERROR] OAuth state expired (older than 5 minutes).');
        throw new app_error_1.BadRequestError('Invalid Meta OAuth state.');
    }
    // 7. Validate and consume state from Redis
    const redisUserId = await (0, redis_util_1.validateAndConsumeMetaOAuthState)(payload.nonce);
    if (!redisUserId || redisUserId !== payload.userId) {
        console.log('[META ERROR] OAuth state Redis validation failed or already consumed.');
        throw new app_error_1.BadRequestError('Invalid Meta OAuth state.');
    }
    const userId = payload.userId;
    console.log('[META] State:', state);
    console.log('[META] User ID:', userId);
    console.log('[META] Callback Success');
    try {
        await meta_service_1.metaService.connectMetaAccount(userId, code);
        res.redirect(`${env_config_1.env.FRONTEND_URL}/dashboard?meta=oauth_complete`);
    }
    catch (err) {
        console.log('[META ERROR] Connection failed during token processing:', err.message);
        res.redirect(`${env_config_1.env.FRONTEND_URL}/dashboard?meta_error=${encodeURIComponent(err.message || 'connection_failed')}`);
    }
});
exports.getAdAccounts = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.user?.userId) {
        throw new app_error_1.UnauthorizedError('Unauthorized');
    }
    const accounts = await meta_service_1.metaService.getAdAccountsForUser(req.user.userId);
    res.status(200).json({
        success: true,
        data: accounts,
    });
});
exports.selectAdAccount = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.user?.userId) {
        throw new app_error_1.UnauthorizedError('Unauthorized');
    }
    const { adAccountId, adAccountName } = req.body;
    if (!adAccountId || !adAccountName) {
        throw new app_error_1.BadRequestError('adAccountId and adAccountName are required');
    }
    const user = await meta_service_1.metaService.selectAdAccount(req.user.userId, adAccountId, adAccountName);
    res.status(200).json({
        success: true,
        message: 'Ad account selected successfully',
        data: {
            adAccountId: user.meta?.adAccountId,
            adAccountName: user.meta?.adAccountName,
            connected: user.meta?.connected,
        },
    });
});
exports.getMetaStatus = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.user?.userId) {
        throw new app_error_1.UnauthorizedError('Unauthorized');
    }
    const status = await meta_service_1.metaService.getMetaStatus(req.user.userId);
    res.status(200).json({
        success: true,
        data: status,
    });
});
exports.getMetaInsights = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.user?.userId) {
        throw new app_error_1.UnauthorizedError('Unauthorized');
    }
    const insights = await meta_service_1.metaService.getInsights(req.user.userId);
    res.status(200).json({
        success: true,
        data: insights,
    });
});

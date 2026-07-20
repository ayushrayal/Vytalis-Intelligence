"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdAccounts = exports.getMetaStatus = exports.metaCallback = exports.connectMeta = void 0;
const meta_service_1 = require("./meta.service");
const async_handler_1 = require("../../../shared/utils/async-handler");
const app_error_1 = require("../../../shared/errors/app-error");
const env_config_1 = require("../../../config/env.config");
const jwt_util_1 = require("../../../shared/utils/jwt.util");
const constants_1 = require("../../../shared/constants");
exports.connectMeta = (0, async_handler_1.asyncHandler)(async (_req, res) => {
    const authUrl = meta_service_1.metaService.getMetaAuthUrl();
    res.redirect(authUrl);
});
exports.metaCallback = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const code = req.query.code || 'mock_code';
    const error = req.query.error;
    if (error) {
        res.redirect(`${env_config_1.env.FRONTEND_URL}/dashboard?meta_error=${encodeURIComponent(error)}`);
        return;
    }
    // Retrieve user ID from authorization header, req.user, or access token cookie
    let userId = req.user?.userId;
    if (!userId) {
        const tokenCookie = req.cookies[constants_1.COOKIE_KEYS.ACCESS_TOKEN];
        if (tokenCookie) {
            try {
                const payload = (0, jwt_util_1.verifyAccessToken)(tokenCookie);
                userId = payload.userId;
            }
            catch {
                // Token invalid or expired
            }
        }
    }
    if (!userId) {
        res.redirect(`${env_config_1.env.FRONTEND_URL}/login?error=session_expired`);
        return;
    }
    try {
        await meta_service_1.metaService.connectMetaAccount(userId, code);
        res.redirect(`${env_config_1.env.FRONTEND_URL}/dashboard?meta=connected`);
    }
    catch (err) {
        res.redirect(`${env_config_1.env.FRONTEND_URL}/dashboard?meta_error=${encodeURIComponent(err.message || 'connection_failed')}`);
    }
});
exports.getMetaStatus = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.user?.userId) {
        throw new app_error_1.UnauthorizedError('Unauthorized');
    }
    const status = await meta_service_1.metaService.getMetaStatus(req.user.userId);
    res.status(200).json({
        connected: status.connected,
        adAccounts: status.adAccounts,
    });
});
exports.getAdAccounts = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.user?.userId) {
        throw new app_error_1.UnauthorizedError('Unauthorized');
    }
    const adAccounts = await meta_service_1.metaService.getDecryptedAdAccounts(req.user.userId);
    res.status(200).json({
        success: true,
        data: {
            adAccounts,
        },
    });
});

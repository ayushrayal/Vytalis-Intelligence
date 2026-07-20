"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refresh = exports.googleCallback = exports.googleAuth = void 0;
const auth_service_1 = require("./auth.service");
const cookie_util_1 = require("../../shared/utils/cookie.util");
const constants_1 = require("../../shared/constants");
const env_config_1 = require("../../config/env.config");
const async_handler_1 = require("../../shared/utils/async-handler");
const app_error_1 = require("../../shared/errors/app-error");
exports.googleAuth = (0, async_handler_1.asyncHandler)(async (_req, res) => {
    const url = auth_service_1.authService.getGoogleAuthUrl();
    res.redirect(url);
});
exports.googleCallback = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const code = req.query.code;
    const error = req.query.error;
    if (error || !code) {
        res.redirect(`${env_config_1.env.FRONTEND_URL}/login?error=${encodeURIComponent(error || 'authentication_cancelled')}`);
        return;
    }
    try {
        const { user, accessToken, refreshToken } = await auth_service_1.authService.handleGoogleCallback(code);
        (0, cookie_util_1.setAuthCookies)(res, accessToken, refreshToken);
        const redirectPath = user.isOnboarded ? '/dashboard' : '/welcome';
        console.log('FRONTEND_URL:', env_config_1.env.FRONTEND_URL);
        console.log('Redirecting to:', `${env_config_1.env.FRONTEND_URL}${redirectPath}`);
        res.redirect(`${env_config_1.env.FRONTEND_URL}${redirectPath}`);
    }
    catch (err) {
        res.redirect(`${env_config_1.env.FRONTEND_URL}/login?error=auth_failed`);
    }
});
exports.refresh = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const refreshToken = req.cookies[constants_1.COOKIE_KEYS.REFRESH_TOKEN] ||
        req.body?.refreshToken ||
        req.headers['x-refresh-token'];
    if (!refreshToken || typeof refreshToken !== 'string') {
        (0, cookie_util_1.clearAuthCookies)(res);
        throw new app_error_1.UnauthorizedError('Refresh token missing');
    }
    try {
        const { accessToken, refreshToken: newRefreshToken } = await auth_service_1.authService.refreshSession(refreshToken);
        (0, cookie_util_1.setAuthCookies)(res, accessToken, newRefreshToken);
        res.status(200).json({
            success: true,
            data: {
                accessToken,
            },
        });
    }
    catch (error) {
        (0, cookie_util_1.clearAuthCookies)(res);
        throw new app_error_1.UnauthorizedError('Invalid or expired refresh token');
    }
});
exports.logout = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (req.user?.userId) {
        await auth_service_1.authService.logout(req.user.userId);
    }
    (0, cookie_util_1.clearAuthCookies)(res);
    res.status(200).json({
        success: true,
        message: 'Logged out successfully',
    });
});

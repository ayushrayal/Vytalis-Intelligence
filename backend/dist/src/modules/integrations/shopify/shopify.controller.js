"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShopDetails = exports.getShopifyStatus = exports.shopifyCallback = exports.connectShopify = void 0;
const shopify_service_1 = require("./shopify.service");
const async_handler_1 = require("../../../shared/utils/async-handler");
const app_error_1 = require("../../../shared/errors/app-error");
const env_config_1 = require("../../../config/env.config");
const jwt_util_1 = require("../../../shared/utils/jwt.util");
const constants_1 = require("../../../shared/constants");
exports.connectShopify = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const shop = req.query.shop || 'my-store.myshopify.com';
    if (!shop) {
        throw new app_error_1.BadRequestError('Shop domain query parameter (?shop=store.myshopify.com) is required');
    }
    const authUrl = shopify_service_1.shopifyService.getShopifyAuthUrl(shop);
    res.redirect(authUrl);
});
exports.shopifyCallback = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const shop = req.query.shop || 'my-store.myshopify.com';
    const code = req.query.code || 'mock_code';
    const error = req.query.error;
    if (error) {
        res.redirect(`${env_config_1.env.FRONTEND_URL}/dashboard?shopify_error=${encodeURIComponent(error)}`);
        return;
    }
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
        await shopify_service_1.shopifyService.connectShopifyStore(userId, shop, code);
        res.redirect(`${env_config_1.env.FRONTEND_URL}/dashboard?shopify=connected`);
    }
    catch (err) {
        res.redirect(`${env_config_1.env.FRONTEND_URL}/dashboard?shopify_error=${encodeURIComponent(err.message || 'connection_failed')}`);
    }
});
exports.getShopifyStatus = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.user?.userId) {
        throw new app_error_1.UnauthorizedError('Unauthorized');
    }
    const status = await shopify_service_1.shopifyService.getShopifyStatus(req.user.userId);
    res.status(200).json({
        connected: status.connected,
        shopDomain: status.shopDomain,
    });
});
exports.getShopDetails = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.user?.userId) {
        throw new app_error_1.UnauthorizedError('Unauthorized');
    }
    const shop = await shopify_service_1.shopifyService.getDecryptedShopDetails(req.user.userId);
    res.status(200).json({
        success: true,
        data: shop,
    });
});

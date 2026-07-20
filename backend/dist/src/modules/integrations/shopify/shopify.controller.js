"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectShopify = exports.getShopifyProducts = exports.getShopifyOrders = exports.getShopDetails = exports.getShopifyStatus = exports.shopifyCallback = exports.connectShopify = void 0;
const shopify_service_1 = require("./shopify.service");
const async_handler_1 = require("../../../shared/utils/async-handler");
const app_error_1 = require("../../../shared/errors/app-error");
const env_config_1 = require("../../../config/env.config");
const redis_util_1 = require("../../../shared/utils/redis.util");
exports.connectShopify = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.user?.userId) {
        throw new app_error_1.UnauthorizedError('Unauthorized');
    }
    const shop = req.query.shop || 'my-store.myshopify.com';
    if (!shop) {
        throw new app_error_1.BadRequestError('Shop domain query parameter (?shop=store.myshopify.com) is required');
    }
    const authUrl = await shopify_service_1.shopifyService.getShopifyAuthUrl(req.user.userId, shop);
    res.redirect(authUrl);
});
exports.shopifyCallback = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const state = req.query.state;
    const shop = req.query.shop || 'my-store.myshopify.com';
    const code = req.query.code || 'mock_code';
    const error = req.query.error;
    if (error) {
        res.redirect(`${env_config_1.env.FRONTEND_URL}/dashboard?shopify_error=${encodeURIComponent(error)}`);
        return;
    }
    let userId = req.user?.userId;
    // Consume Redis OAuth state parameter if third-party redirect stripped session cookie
    if (!userId && state) {
        try {
            const decodedJson = Buffer.from(state, 'base64').toString('utf-8');
            const parsed = JSON.parse(decodedJson);
            if (parsed.nonce) {
                const validatedUserId = await (0, redis_util_1.validateAndConsumeShopifyOAuthState)(parsed.nonce);
                if (validatedUserId) {
                    userId = validatedUserId;
                }
            }
        }
        catch {
            // Ignore JSON decode error
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
        success: true,
        data: status,
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
exports.getShopifyOrders = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.user?.userId) {
        throw new app_error_1.UnauthorizedError('Unauthorized');
    }
    const metrics = await shopify_service_1.shopifyService.fetchShopifyMetrics(req.user.userId);
    res.status(200).json({
        success: true,
        data: {
            ordersCount: metrics.ordersCount,
            totalRevenue: metrics.totalRevenue,
            customersCount: metrics.customersCount,
            averageOrderValue: metrics.averageOrderValue,
            currency: metrics.currency,
            lastSyncedAt: metrics.lastSyncedAt,
        },
    });
});
exports.getShopifyProducts = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.user?.userId) {
        throw new app_error_1.UnauthorizedError('Unauthorized');
    }
    const metrics = await shopify_service_1.shopifyService.fetchShopifyMetrics(req.user.userId);
    res.status(200).json({
        success: true,
        data: {
            productsCount: metrics.productsCount,
            lastSyncedAt: metrics.lastSyncedAt,
        },
    });
});
exports.disconnectShopify = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.user?.userId) {
        throw new app_error_1.UnauthorizedError('Unauthorized');
    }
    await shopify_service_1.shopifyService.disconnectShopifyStore(req.user.userId);
    res.status(200).json({
        success: true,
        message: 'Shopify store disconnected successfully',
    });
});

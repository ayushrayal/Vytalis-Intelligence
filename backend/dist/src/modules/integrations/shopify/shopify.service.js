"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shopifyService = exports.ShopifyService = void 0;
const axios_1 = __importDefault(require("axios"));
const env_config_1 = require("../../../config/env.config");
const encryption_util_1 = require("../../../shared/utils/encryption.util");
const user_repository_1 = require("../../users/user.repository");
const app_error_1 = require("../../../shared/errors/app-error");
class ShopifyService {
    normalizeShopDomain(rawDomain) {
        let cleaned = rawDomain.trim().toLowerCase();
        cleaned = cleaned.replace(/^https?:\/\//, '');
        cleaned = cleaned.replace(/\/.*$/, '');
        if (!cleaned.includes('.myshopify.com')) {
            cleaned = `${cleaned}.myshopify.com`;
        }
        return cleaned;
    }
    getShopifyAuthUrl(shopDomain) {
        const normalizedShop = this.normalizeShopDomain(shopDomain);
        const params = new URLSearchParams({
            client_id: env_config_1.env.SHOPIFY_CLIENT_ID,
            scope: env_config_1.env.SHOPIFY_SCOPES,
            redirect_uri: env_config_1.env.SHOPIFY_REDIRECT_URI,
            state: 'vytalis_shopify_state',
        });
        return `https://${normalizedShop}/admin/oauth/authorize?${params.toString()}`;
    }
    async exchangeCodeForToken(shopDomain, code) {
        const normalizedShop = this.normalizeShopDomain(shopDomain);
        if (env_config_1.env.NODE_ENV === 'development' && (code === 'mock_code' || env_config_1.env.SHOPIFY_CLIENT_ID === 'mock_shopify_client_id')) {
            return `mock_shopify_offline_access_token_${normalizedShop}_12345`;
        }
        try {
            const response = await axios_1.default.post(`https://${normalizedShop}/admin/oauth/access_token`, {
                client_id: env_config_1.env.SHOPIFY_CLIENT_ID,
                client_secret: env_config_1.env.SHOPIFY_CLIENT_SECRET,
                code,
            });
            return response.data.access_token;
        }
        catch (error) {
            throw new app_error_1.BadRequestError(`Failed to exchange Shopify authorization code: ${error?.response?.data?.error_description || error.message}`);
        }
    }
    encryptShopifyToken(token) {
        return (0, encryption_util_1.encryptToken)(token);
    }
    async fetchShopDetails(shopDomain, accessToken) {
        const normalizedShop = this.normalizeShopDomain(shopDomain);
        if (env_config_1.env.NODE_ENV === 'development' && (accessToken.startsWith('mock_') || env_config_1.env.SHOPIFY_CLIENT_ID === 'mock_shopify_client_id')) {
            const storeName = normalizedShop.replace('.myshopify.com', '').replace(/[-_]/g, ' ');
            const capitalized = storeName.charAt(0).toUpperCase() + storeName.slice(1);
            return {
                shopDomain: normalizedShop,
                shopName: `${capitalized} Official Store`,
            };
        }
        try {
            const response = await axios_1.default.get(`https://${normalizedShop}/admin/api/2024-01/shop.json`, {
                headers: {
                    'X-Shopify-Access-Token': accessToken,
                },
            });
            return {
                shopDomain: response.data.shop.myshopify_domain || normalizedShop,
                shopName: response.data.shop.name || normalizedShop,
            };
        }
        catch (error) {
            throw new app_error_1.BadRequestError(`Failed to fetch Shopify store profile: ${error?.response?.data?.errors || error.message}`);
        }
    }
    async connectShopifyStore(userId, shopDomain, code) {
        const normalizedShop = this.normalizeShopDomain(shopDomain);
        const accessToken = await this.exchangeCodeForToken(normalizedShop, code);
        const encryptedAccessToken = this.encryptShopifyToken(accessToken);
        const shopDetails = await this.fetchShopDetails(normalizedShop, accessToken);
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user) {
            throw new app_error_1.NotFoundError('User account not found');
        }
        user.shopify = {
            connected: true,
            encryptedAccessToken,
            shopDomain: shopDetails.shopDomain,
            shopName: shopDetails.shopName,
            lastSyncedAt: new Date(),
        };
        user.connectedAccounts.shopifyConnected = true;
        await user.save();
        return user;
    }
    async getShopifyStatus(userId) {
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user) {
            throw new app_error_1.NotFoundError('User account not found');
        }
        const connected = !!(user.shopify?.connected && user.shopify?.encryptedAccessToken);
        const shopDomain = user.shopify?.shopDomain || '';
        return {
            connected,
            shopDomain,
        };
    }
    async getDecryptedShopDetails(userId) {
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user || !user.shopify?.connected || !user.shopify?.encryptedAccessToken || !user.shopify?.shopDomain) {
            throw new app_error_1.BadRequestError('Shopify store is not connected');
        }
        const decryptedToken = (0, encryption_util_1.decryptToken)(user.shopify.encryptedAccessToken);
        return this.fetchShopDetails(user.shopify.shopDomain, decryptedToken);
    }
}
exports.ShopifyService = ShopifyService;
exports.shopifyService = new ShopifyService();

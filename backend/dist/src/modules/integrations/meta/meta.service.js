"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metaService = exports.MetaService = void 0;
const axios_1 = __importDefault(require("axios"));
const env_config_1 = require("../../../config/env.config");
const encryption_util_1 = require("../../../shared/utils/encryption.util");
const user_repository_1 = require("../../users/user.repository");
const app_error_1 = require("../../../shared/errors/app-error");
class MetaService {
    getMetaAuthUrl() {
        const scopes = ['ads_read', 'read_insights', 'business_management'].join(',');
        const params = new URLSearchParams({
            client_id: env_config_1.env.META_APP_ID,
            redirect_uri: env_config_1.env.META_REDIRECT_URI,
            scope: scopes,
            response_type: 'code',
            state: 'vytalis_meta_state',
        });
        return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
    }
    async exchangeCodeForToken(code) {
        if (env_config_1.env.NODE_ENV === 'development' && (code === 'mock_code' || env_config_1.env.META_APP_ID === 'mock_meta_app_id')) {
            return 'mock_short_lived_meta_access_token_12345';
        }
        try {
            const response = await axios_1.default.get('https://graph.facebook.com/v19.0/oauth/access_token', {
                params: {
                    client_id: env_config_1.env.META_APP_ID,
                    client_secret: env_config_1.env.META_APP_SECRET,
                    redirect_uri: env_config_1.env.META_REDIRECT_URI,
                    code,
                },
            });
            return response.data.access_token;
        }
        catch (error) {
            throw new app_error_1.BadRequestError(`Failed to exchange Meta authorization code: ${error?.response?.data?.error?.message || error.message}`);
        }
    }
    async exchangeForLongLivedToken(shortLivedToken) {
        if (env_config_1.env.NODE_ENV === 'development' && (shortLivedToken.startsWith('mock_') || env_config_1.env.META_APP_ID === 'mock_meta_app_id')) {
            return 'mock_long_lived_meta_access_token_60days_98765';
        }
        try {
            const response = await axios_1.default.get('https://graph.facebook.com/v19.0/oauth/access_token', {
                params: {
                    grant_type: 'fb_exchange_token',
                    client_id: env_config_1.env.META_APP_ID,
                    client_secret: env_config_1.env.META_APP_SECRET,
                    fb_exchange_token: shortLivedToken,
                },
            });
            return response.data.access_token;
        }
        catch (error) {
            throw new app_error_1.BadRequestError(`Failed to exchange for Meta long-lived token: ${error?.response?.data?.error?.message || error.message}`);
        }
    }
    encryptMetaToken(token) {
        return (0, encryption_util_1.encryptToken)(token);
    }
    async fetchMetaUser(accessToken) {
        if (env_config_1.env.NODE_ENV === 'development' && (accessToken.startsWith('mock_') || env_config_1.env.META_APP_ID === 'mock_meta_app_id')) {
            return { id: 'meta_user_998877', name: 'Vytalis Meta Business User' };
        }
        try {
            const response = await axios_1.default.get('https://graph.facebook.com/v19.0/me', {
                params: {
                    access_token: accessToken,
                    fields: 'id,name',
                },
            });
            return response.data;
        }
        catch (error) {
            throw new app_error_1.BadRequestError(`Failed to fetch Meta user profile: ${error?.response?.data?.error?.message || error.message}`);
        }
    }
    async fetchAdAccounts(accessToken) {
        if (env_config_1.env.NODE_ENV === 'development' && (accessToken.startsWith('mock_') || env_config_1.env.META_APP_ID === 'mock_meta_app_id')) {
            return [
                { id: 'act_101010', name: 'Vytalis Meta Growth Ad Account', currency: 'INR', accountStatus: 1 },
                { id: 'act_202020', name: 'Vytalis Meta Retargeting Account', currency: 'USD', accountStatus: 1 },
            ];
        }
        try {
            const response = await axios_1.default.get('https://graph.facebook.com/v19.0/me/adaccounts', {
                params: {
                    access_token: accessToken,
                    fields: 'id,name,currency,account_status',
                },
            });
            return (response.data.data || []).map((acc) => ({
                id: acc.id,
                name: acc.name,
                currency: acc.currency,
                accountStatus: acc.account_status,
            }));
        }
        catch (error) {
            throw new app_error_1.BadRequestError(`Failed to fetch Meta ad accounts: ${error?.response?.data?.error?.message || error.message}`);
        }
    }
    async connectMetaAccount(userId, code) {
        const shortToken = await this.exchangeCodeForToken(code);
        const longToken = await this.exchangeForLongLivedToken(shortToken);
        const encryptedAccessToken = this.encryptMetaToken(longToken);
        const metaUser = await this.fetchMetaUser(longToken);
        const adAccounts = await this.fetchAdAccounts(longToken);
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user) {
            throw new app_error_1.NotFoundError('User account not found');
        }
        user.meta = {
            connected: true,
            encryptedAccessToken,
            userId: metaUser.id,
            lastSyncedAt: new Date(),
            adAccounts,
        };
        user.connectedAccounts.metaConnected = true;
        await user.save();
        return user;
    }
    async getMetaStatus(userId) {
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user) {
            throw new app_error_1.NotFoundError('User account not found');
        }
        const connected = !!(user.meta?.connected && user.meta?.encryptedAccessToken);
        const adAccountsCount = user.meta?.adAccounts?.length || 0;
        return {
            connected,
            adAccounts: adAccountsCount,
        };
    }
    async getDecryptedAdAccounts(userId) {
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user || !user.meta?.connected || !user.meta?.encryptedAccessToken) {
            throw new app_error_1.BadRequestError('Meta account is not connected');
        }
        const decryptedToken = (0, encryption_util_1.decryptToken)(user.meta.encryptedAccessToken);
        return this.fetchAdAccounts(decryptedToken);
    }
}
exports.MetaService = MetaService;
exports.metaService = new MetaService();

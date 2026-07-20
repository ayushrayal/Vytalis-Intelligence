"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLAN_LIMITS = exports.SUBSCRIPTION_PLANS = exports.TOKEN_EXPIRY = exports.COOKIE_KEYS = void 0;
exports.COOKIE_KEYS = {
    ACCESS_TOKEN: 'vytalis_access',
    REFRESH_TOKEN: 'vytalis_refresh',
};
exports.TOKEN_EXPIRY = {
    ACCESS_TOKEN_MS: 15 * 60 * 1000, // 15 mins
    REFRESH_TOKEN_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
    ACCESS_TOKEN_JWT: '15m',
    REFRESH_TOKEN_JWT: '7d',
};
exports.SUBSCRIPTION_PLANS = {
    STARTER: 'starter',
    GROWTH: 'growth',
    AGENCY: 'agency',
};
exports.PLAN_LIMITS = {
    starter: { maxStores: 1, maxAdAccounts: 1 },
    growth: { maxStores: 3, maxAdAccounts: 3 },
    agency: { maxStores: 999, maxAdAccounts: 999 },
};

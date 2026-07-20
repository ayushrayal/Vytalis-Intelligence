export const COOKIE_KEYS = {
  ACCESS_TOKEN: 'vytalis_access',
  REFRESH_TOKEN: 'vytalis_refresh',
} as const;

export const TOKEN_EXPIRY = {
  ACCESS_TOKEN_MS: 15 * 60 * 1000, // 15 mins
  REFRESH_TOKEN_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
  ACCESS_TOKEN_JWT: '15m',
  REFRESH_TOKEN_JWT: '7d',
} as const;

export const SUBSCRIPTION_PLANS = {
  STARTER: 'starter',
  GROWTH: 'growth',
  AGENCY: 'agency',
} as const;

export const PLAN_LIMITS = {
  starter: { maxStores: 1, maxAdAccounts: 1 },
  growth: { maxStores: 3, maxAdAccounts: 3 },
  agency: { maxStores: 999, maxAdAccounts: 999 },
} as const;

import crypto from 'crypto';
import axios from 'axios';
import { env } from '../../../config/env.config';
import { encryptToken, decryptToken } from '../../../shared/utils/encryption.util';
import { metaRepository } from './meta.repository';
import { BadRequestError, NotFoundError } from '../../../shared/errors/app-error';
import { getMetaInsightsCache, storeMetaInsightsCache, storeMetaOAuthState } from '../../../shared/utils/redis.util';
import { User } from '../../users/user.model';

export interface IMetaSimpleAdAccount {
  id: string;
  name: string;
}

export interface IMetaInsights {
  spend: number;
  reach: number;
  impressions: number;
  frequency: number;
  clicks: number;
  ctr: number;
  purchases: number;
  revenue: number;
  roas: number;
  cached?: boolean;
}

export class MetaService {
  async getMetaAuthUrl(userId: string): Promise<string> {
    const nonce = `meta_${crypto.randomUUID()}`;
    const timestamp = Date.now();

    await storeMetaOAuthState(nonce, userId);

    const statePayload = {
      userId,
      nonce,
      timestamp,
    };

    const state = Buffer.from(JSON.stringify(statePayload)).toString('base64');
    const scopes = ['public_profile', 'email'].join(',');

    const params = new URLSearchParams({
      client_id: env.META_APP_ID,
      redirect_uri: env.META_REDIRECT_URI,
      scope: scopes,
      response_type: 'code',
      state,
    });

    return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<string> {
    if (env.NODE_ENV === 'development' && (code === 'mock_code' || env.META_APP_ID === 'mock_meta_app_id')) {
      return 'mock_short_lived_meta_access_token_12345';
    }

    try {
      const response = await axios.get<{ access_token: string }>('https://graph.facebook.com/v19.0/oauth/access_token', {
        params: {
          client_id: env.META_APP_ID,
          client_secret: env.META_APP_SECRET,
          redirect_uri: env.META_REDIRECT_URI,
          code,
        },
      });
      return response.data.access_token;
    } catch (error: any) {
      throw new BadRequestError(`Failed to exchange Meta authorization code: ${error?.response?.data?.error?.message || error.message}`);
    }
  }

  async exchangeForLongLivedToken(shortLivedToken: string): Promise<{ accessToken: string; expiresInSeconds: number }> {
    if (env.NODE_ENV === 'development' && (shortLivedToken.startsWith('mock_') || env.META_APP_ID === 'mock_meta_app_id')) {
      return {
        accessToken: 'mock_long_lived_meta_access_token_60days_98765',
        expiresInSeconds: 5184000, // 60 days
      };
    }

    try {
      const response = await axios.get<{ access_token: string; expires_in?: number }>('https://graph.facebook.com/v19.0/oauth/access_token', {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: env.META_APP_ID,
          client_secret: env.META_APP_SECRET,
          fb_exchange_token: shortLivedToken,
        },
      });
      return {
        accessToken: response.data.access_token,
        expiresInSeconds: response.data.expires_in || 5184000,
      };
    } catch (error: any) {
      throw new BadRequestError(`Failed to exchange for Meta long-lived token: ${error?.response?.data?.error?.message || error.message}`);
    }
  }

  encryptMetaToken(token: string): string {
    return encryptToken(token);
  }

  decryptMetaToken(encryptedToken: string): string {
    return decryptToken(encryptedToken);
  }

  async verifyPermissions(accessToken: string): Promise<string[]> {
    if (env.NODE_ENV === 'development' && (accessToken.startsWith('mock_') || env.META_APP_ID === 'mock_meta_app_id')) {
      console.log('[META PERMISSIONS] Granted Scopes:', ['public_profile', 'email', 'ads_read']);
      console.log('[META PERMISSIONS] ads_read granted: true');
      return ['public_profile', 'email', 'ads_read'];
    }

    try {
      const response = await axios.get<{
        data: Array<{ permission: string; status: string }>;
      }>('https://graph.facebook.com/v19.0/me/permissions', {
        params: { access_token: accessToken },
      });

      const grantedScopes = (response.data.data || [])
        .filter((p) => p.status === 'granted')
        .map((p) => p.permission);

      console.log('[META PERMISSIONS] Granted Scopes:', grantedScopes);
      const hasAdsRead = grantedScopes.includes('ads_read');
      console.log('[META PERMISSIONS] ads_read granted:', hasAdsRead);

      if (!hasAdsRead) {
        console.log('[META ERROR] ads_read permission not available.');
        console.log('Meta App Review approval is required for production usage.');
      }

      return grantedScopes;
    } catch (error: any) {
      console.log('[META ERROR] Failed to inspect Meta permissions:', error?.response?.data?.error?.message || error.message);
      return [];
    }
  }

  async fetchMetaUser(accessToken: string): Promise<{ id: string; name: string }> {
    if (env.NODE_ENV === 'development' && (accessToken.startsWith('mock_') || env.META_APP_ID === 'mock_meta_app_id')) {
      return { id: 'meta_user_998877', name: 'Vytalis Meta Business User' };
    }

    try {
      const response = await axios.get<{ id: string; name: string }>('https://graph.facebook.com/v19.0/me', {
        params: {
          access_token: accessToken,
          fields: 'id,name',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new BadRequestError(`Failed to fetch Meta user profile: ${error?.response?.data?.error?.message || error.message}`);
    }
  }

  async fetchAdAccounts(accessToken: string): Promise<IMetaSimpleAdAccount[]> {
    if (env.NODE_ENV === 'development' && (accessToken.startsWith('mock_') || env.META_APP_ID === 'mock_meta_app_id')) {
      return [
        { id: 'act_101010101', name: 'Vytalis Media (Primary Ad Account)' },
        { id: 'act_202020202', name: 'Vytalis Secondary Retargeting Account' },
      ];
    }

    try {
      const response = await axios.get<{
        data: Array<{
          id: string;
          name: string;
        }>;
      }>('https://graph.facebook.com/v19.0/me/adaccounts', {
        params: {
          access_token: accessToken,
          fields: 'id,name',
        },
      });

      const accounts = (response.data.data || []).map((acc) => ({
        id: acc.id,
        name: acc.name,
      }));

      console.log('[META] /me/adaccounts returned count:', accounts.length);
      return accounts;
    } catch (error: any) {
      console.log('[META ERROR] /me/adaccounts call failed:', error?.response?.data?.error?.message || error.message);
      if (error?.response?.data?.error?.message?.includes('ads_read') || error?.response?.data?.error?.code === 200) {
        console.log('[META ERROR] ads_read permission not available.');
        console.log('Meta App Review approval is required for production usage.');
      }
      throw new BadRequestError(`Failed to fetch Meta ad accounts: ${error?.response?.data?.error?.message || error.message}`);
    }
  }

  async connectMetaAccount(userId: string, code: string) {
    console.log('[META] Callback Hit');
    console.log('[META] User ID:', userId);
    console.log('[META] OAuth Code received');

    const shortToken = await this.exchangeCodeForToken(code);
    const { accessToken: longToken, expiresInSeconds } = await this.exchangeForLongLivedToken(shortToken);
    const encryptedAccessToken = this.encryptMetaToken(longToken);

    console.log('[META] Access Token generated successfully');
    const tokenExpiresAt = new Date(Date.now() + expiresInSeconds * 1000);
    console.log('[META] Token Expires:', tokenExpiresAt);

    // Verify Meta Scopes & Permissions
    await this.verifyPermissions(longToken);

    const metaUser = await this.fetchMetaUser(longToken);

    let accounts: IMetaSimpleAdAccount[] = [];
    try {
      accounts = await this.fetchAdAccounts(longToken);
      console.log('[META] Ad Accounts:', accounts);
    } catch (err: any) {
      console.log('[META ERROR] Could not list ad accounts during connect step:', err.message);
    }

    const updatedUser = await metaRepository.updateMetaOAuthState(userId, {
      encryptedAccessToken,
      metaUserId: metaUser.id,
      tokenExpiresAt,
    });

    if (!updatedUser) {
      throw new NotFoundError('User account not found');
    }

    console.log('[META] Mongo Update Success');

    const userDb = await User.findById(userId);
    if (userDb && userDb.meta) {
      console.log({
        connected: userDb.meta.connected,
        adAccountId: userDb.meta.adAccountId,
        adAccountName: userDb.meta.adAccountName,
        tokenExists: !!userDb.meta.encryptedAccessToken,
      });
      console.log('[META] Connected:', userDb.meta.connected);
    }

    return updatedUser;
  }

  async getAdAccountsForUser(userId: string): Promise<IMetaSimpleAdAccount[]> {
    const user = await metaRepository.findUserById(userId);
    if (!user || !user.meta?.encryptedAccessToken) {
      throw new BadRequestError('Meta OAuth authorization required before listing ad accounts');
    }

    const decryptedToken = this.decryptMetaToken(user.meta.encryptedAccessToken);
    return this.fetchAdAccounts(decryptedToken);
  }

  async selectAdAccount(userId: string, adAccountId: string, adAccountName: string) {
    const user = await metaRepository.findUserById(userId);
    if (!user || !user.meta?.encryptedAccessToken) {
      throw new BadRequestError('Meta OAuth authorization required before selecting an ad account');
    }

    const updatedUser = await metaRepository.selectAdAccount(userId, adAccountId, adAccountName);
    if (!updatedUser) {
      throw new NotFoundError('User account not found');
    }

    return updatedUser;
  }

  async getMetaStatus(userId: string): Promise<{
    connected: boolean;
    adAccountId?: string;
    adAccountName?: string;
    connectedAt?: Date;
    lastSyncedAt?: Date;
    tokenExpiresAt?: Date;
    isExpired?: boolean;
    hasToken?: boolean;
  }> {
    const user = await metaRepository.findUserById(userId);
    if (!user || !user.meta) {
      return { connected: false };
    }

    const { connected, encryptedAccessToken, adAccountId, adAccountName, connectedAt, lastSyncedAt, tokenExpiresAt } = user.meta;
    const hasToken = !!encryptedAccessToken;

    // Check token expiry
    if (tokenExpiresAt && new Date() > new Date(tokenExpiresAt)) {
      if (connected) {
        await metaRepository.disconnectMeta(userId);
      }
      return {
        connected: false,
        isExpired: true,
        hasToken: true,
        tokenExpiresAt,
      };
    }

    return {
      connected: !!(connected && adAccountId),
      adAccountId,
      adAccountName,
      connectedAt,
      lastSyncedAt,
      tokenExpiresAt,
      hasToken,
    };
  }

  async getInsights(userId: string): Promise<IMetaInsights> {
    // 1. Check Redis Insights Cache first
    const cachedData = await getMetaInsightsCache(userId);
    if (cachedData) {
      return { ...cachedData, cached: true };
    }

    const user = await metaRepository.findUserById(userId);

    // Development Fallback mock when token/connection missing
    const isMockDev =
      env.NODE_ENV === 'development' &&
      (!user || !user.meta?.connected || !user.meta?.encryptedAccessToken || !user.meta?.adAccountId || env.META_APP_ID === 'mock_meta_app_id');

    if (isMockDev) {
      const mockInsights: IMetaInsights = {
        spend: 5000,
        reach: 50000,
        impressions: 100000,
        frequency: 2.0,
        clicks: 2400,
        ctr: 2.4,
        purchases: 12,
        revenue: 12500,
        roas: 2.5,
      };

      await storeMetaInsightsCache(userId, mockInsights);
      await metaRepository.updateMetaLastSynced(userId);
      return mockInsights;
    }

    if (!user || !user.meta?.connected || !user.meta?.encryptedAccessToken || !user.meta?.adAccountId) {
      throw new BadRequestError('Meta Ad account is not connected');
    }

    // Check expiry
    if (user.meta.tokenExpiresAt && new Date() > new Date(user.meta.tokenExpiresAt)) {
      await metaRepository.disconnectMeta(userId);
      throw new BadRequestError('Meta access token expired. Please reconnect Meta.');
    }

    try {
      const decryptedToken = this.decryptMetaToken(user.meta.encryptedAccessToken);
      const adAccountId = user.meta.adAccountId.startsWith('act_') ? user.meta.adAccountId : `act_${user.meta.adAccountId}`;

      const response = await axios.get<{
        data: Array<{
          spend?: string;
          reach?: string;
          impressions?: string;
          frequency?: string;
          clicks?: string;
          ctr?: string;
          actions?: Array<{ action_type: string; value: string }>;
          action_values?: Array<{ action_type: string; value: string }>;
        }>;
      }>(`https://graph.facebook.com/v19.0/${adAccountId}/insights`, {
        params: {
          access_token: decryptedToken,
          date_preset: 'last_7_days',
          fields: 'spend,reach,impressions,frequency,clicks,ctr,actions,action_values',
        },
      });

      const row = response.data.data?.[0] || {};
      const spend = parseFloat(row.spend || '0');
      const reach = parseInt(row.reach || '0', 10);
      const impressions = parseInt(row.impressions || '0', 10);
      const frequency = parseFloat(row.frequency || (reach > 0 ? (impressions / reach).toFixed(2) : '0'));
      const clicks = parseInt(row.clicks || '0', 10);
      const ctr = parseFloat(row.ctr || (impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0'));

      let purchases = 0;
      if (Array.isArray(row.actions)) {
        for (const act of row.actions) {
          if (act.action_type === 'offsite_conversion.fb_pixel_purchase' || act.action_type === 'purchase') {
            purchases += parseInt(act.value || '0', 10);
          }
        }
      }

      let revenue = 0;
      if (Array.isArray(row.action_values)) {
        for (const act of row.action_values) {
          if (act.action_type === 'offsite_conversion.fb_pixel_purchase' || act.action_type === 'purchase') {
            revenue += parseFloat(act.value || '0');
          }
        }
      }

      const roas = spend > 0 ? parseFloat((revenue / spend).toFixed(2)) : 0;

      const insights: IMetaInsights = {
        spend,
        reach,
        impressions,
        frequency,
        clicks,
        ctr,
        purchases,
        revenue,
        roas,
      };

      // Cache in Redis (15 mins) & update lastSyncedAt in Mongo
      await storeMetaInsightsCache(userId, insights);
      await metaRepository.updateMetaLastSynced(userId);

      return insights;
    } catch (error: any) {
      throw new BadRequestError(`Failed to fetch Meta Insights: ${error?.response?.data?.error?.message || error.message}`);
    }
  }
}

export const metaService = new MetaService();

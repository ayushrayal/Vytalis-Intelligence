import axios from 'axios';
import { env } from '../../../config/env.config';
import { encryptToken, decryptToken } from '../../../shared/utils/encryption.util';
import { userRepository } from '../../users/user.repository';
import { IMetaAdAccount } from '../../users/user.model';
import { BadRequestError, NotFoundError } from '../../../shared/errors/app-error';

export class MetaService {
  getMetaAuthUrl(): string {
    const scopes = ["public_profile", "email",].join(',');
    const params = new URLSearchParams({
      client_id: env.META_APP_ID,
      redirect_uri: env.META_REDIRECT_URI,
      scope: scopes,
      response_type: 'code',
      state: 'vytalis_meta_state',
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

  async exchangeForLongLivedToken(shortLivedToken: string): Promise<string> {
    if (env.NODE_ENV === 'development' && (shortLivedToken.startsWith('mock_') || env.META_APP_ID === 'mock_meta_app_id')) {
      return 'mock_long_lived_meta_access_token_60days_98765';
    }

    try {
      const response = await axios.get<{ access_token: string }>('https://graph.facebook.com/v19.0/oauth/access_token', {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: env.META_APP_ID,
          client_secret: env.META_APP_SECRET,
          fb_exchange_token: shortLivedToken,
        },
      });
      return response.data.access_token;
    } catch (error: any) {
      throw new BadRequestError(`Failed to exchange for Meta long-lived token: ${error?.response?.data?.error?.message || error.message}`);
    }
  }

  encryptMetaToken(token: string): string {
    return encryptToken(token);
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

  async fetchAdAccounts(accessToken: string): Promise<IMetaAdAccount[]> {
    if (env.NODE_ENV === 'development' && (accessToken.startsWith('mock_') || env.META_APP_ID === 'mock_meta_app_id')) {
      return [
        { id: 'act_101010', name: 'Vytalis Meta Growth Ad Account', currency: 'INR', accountStatus: 1 },
        { id: 'act_202020', name: 'Vytalis Meta Retargeting Account', currency: 'USD', accountStatus: 1 },
      ];
    }

    try {
      const response = await axios.get<{
        data: Array<{
          id: string;
          name: string;
          currency: string;
          account_status: number;
        }>;
      }>('https://graph.facebook.com/v19.0/me/adaccounts', {
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
    } catch (error: any) {
      throw new BadRequestError(`Failed to fetch Meta ad accounts: ${error?.response?.data?.error?.message || error.message}`);
    }
  }

  async connectMetaAccount(userId: string, code: string) {
    const shortToken = await this.exchangeCodeForToken(code);
    const longToken = await this.exchangeForLongLivedToken(shortToken);
    const encryptedAccessToken = this.encryptMetaToken(longToken);

    const metaUser = await this.fetchMetaUser(longToken);
    const adAccounts = await this.fetchAdAccounts(longToken);

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User account not found');
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

  async getMetaStatus(userId: string): Promise<{ connected: boolean; adAccounts: number }> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User account not found');
    }

    const connected = !!(user.meta?.connected && user.meta?.encryptedAccessToken);
    const adAccountsCount = user.meta?.adAccounts?.length || 0;

    return {
      connected,
      adAccounts: adAccountsCount,
    };
  }

  async getDecryptedAdAccounts(userId: string): Promise<IMetaAdAccount[]> {
    const user = await userRepository.findById(userId);
    if (!user || !user.meta?.connected || !user.meta?.encryptedAccessToken) {
      throw new BadRequestError('Meta account is not connected');
    }

    const decryptedToken = decryptToken(user.meta.encryptedAccessToken);
    return this.fetchAdAccounts(decryptedToken);
  }
}

export const metaService = new MetaService();

import axios from 'axios';
import { env } from '../../../config/env.config';
import { encryptToken, decryptToken } from '../../../shared/utils/encryption.util';
import { userRepository } from '../../users/user.repository';
import { BadRequestError, NotFoundError } from '../../../shared/errors/app-error';

export class ShopifyService {
  normalizeShopDomain(rawDomain: string): string {
    let cleaned = rawDomain.trim().toLowerCase();
    cleaned = cleaned.replace(/^https?:\/\//, '');
    cleaned = cleaned.replace(/\/.*$/, '');
    if (!cleaned.includes('.myshopify.com')) {
      cleaned = `${cleaned}.myshopify.com`;
    }
    return cleaned;
  }

  getShopifyAuthUrl(shopDomain: string): string {
    const normalizedShop = this.normalizeShopDomain(shopDomain);
    const params = new URLSearchParams({
      client_id: env.SHOPIFY_CLIENT_ID,
      scope: env.SHOPIFY_SCOPES,
      redirect_uri: env.SHOPIFY_REDIRECT_URI,
      state: 'vytalis_shopify_state',
    });

    return `https://${normalizedShop}/admin/oauth/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(shopDomain: string, code: string): Promise<string> {
    const normalizedShop = this.normalizeShopDomain(shopDomain);

    if (env.NODE_ENV === 'development' && (code === 'mock_code' || env.SHOPIFY_CLIENT_ID === 'mock_shopify_client_id')) {
      return `mock_shopify_offline_access_token_${normalizedShop}_12345`;
    }

    try {
      const response = await axios.post<{ access_token: string }>(
        `https://${normalizedShop}/admin/oauth/access_token`,
        {
          client_id: env.SHOPIFY_CLIENT_ID,
          client_secret: env.SHOPIFY_CLIENT_SECRET,
          code,
        }
      );
      return response.data.access_token;
    } catch (error: any) {
      throw new BadRequestError(`Failed to exchange Shopify authorization code: ${error?.response?.data?.error_description || error.message}`);
    }
  }

  encryptShopifyToken(token: string): string {
    return encryptToken(token);
  }

  async fetchShopDetails(shopDomain: string, accessToken: string): Promise<{ shopDomain: string; shopName: string }> {
    const normalizedShop = this.normalizeShopDomain(shopDomain);

    if (env.NODE_ENV === 'development' && (accessToken.startsWith('mock_') || env.SHOPIFY_CLIENT_ID === 'mock_shopify_client_id')) {
      const storeName = normalizedShop.replace('.myshopify.com', '').replace(/[-_]/g, ' ');
      const capitalized = storeName.charAt(0).toUpperCase() + storeName.slice(1);
      return {
        shopDomain: normalizedShop,
        shopName: `${capitalized} Official Store`,
      };
    }

    try {
      const response = await axios.get<{ shop: { domain: string; name: string; myshopify_domain: string } }>(
        `https://${normalizedShop}/admin/api/2024-01/shop.json`,
        {
          headers: {
            'X-Shopify-Access-Token': accessToken,
          },
        }
      );

      return {
        shopDomain: response.data.shop.myshopify_domain || normalizedShop,
        shopName: response.data.shop.name || normalizedShop,
      };
    } catch (error: any) {
      throw new BadRequestError(`Failed to fetch Shopify store profile: ${error?.response?.data?.errors || error.message}`);
    }
  }

  async connectShopifyStore(userId: string, shopDomain: string, code: string) {
    const normalizedShop = this.normalizeShopDomain(shopDomain);
    const accessToken = await this.exchangeCodeForToken(normalizedShop, code);
    const encryptedAccessToken = this.encryptShopifyToken(accessToken);

    const shopDetails = await this.fetchShopDetails(normalizedShop, accessToken);

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User account not found');
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

  async getShopifyStatus(userId: string): Promise<{ connected: boolean; shopDomain: string }> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User account not found');
    }

    const connected = !!(user.shopify?.connected && user.shopify?.encryptedAccessToken);
    const shopDomain = user.shopify?.shopDomain || '';

    return {
      connected,
      shopDomain,
    };
  }

  async getDecryptedShopDetails(userId: string): Promise<{ shopDomain: string; shopName: string }> {
    const user = await userRepository.findById(userId);
    if (!user || !user.shopify?.connected || !user.shopify?.encryptedAccessToken || !user.shopify?.shopDomain) {
      throw new BadRequestError('Shopify store is not connected');
    }

    const decryptedToken = decryptToken(user.shopify.encryptedAccessToken);
    return this.fetchShopDetails(user.shopify.shopDomain, decryptedToken);
  }
}

export const shopifyService = new ShopifyService();

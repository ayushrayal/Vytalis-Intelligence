import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api.client';

export interface MetaStatusData {
  connected: boolean;
  adAccountId?: string;
  adAccountName?: string;
  connectedAt?: string;
  lastSyncedAt?: string;
  tokenExpiresAt?: string;
  isExpired?: boolean;
  requiresPermission?: boolean;
}

export interface MetaInsightsData {
  spend: number;
  reach: number;
  impressions: number;
  frequency: number;
  clicks: number;
  ctr: number;
  purchases: number;
  revenue: number;
  roas: number;
  requiresPermission?: boolean;
  campaigns?: Array<{
    id: string;
    name: string;
    spend: number;
    revenue: number;
    roas: number;
    purchases: number;
    ctr: number;
  }>;
  spendTrend?: Array<{ date: string; spend: number; revenue: number; roas: number }>;
  placementBreakdown?: Array<{ name: string; value: number }>;
  ageBreakdown?: Array<{ age: string; spend: number; revenue: number }>;
}

export interface ShopifyStatusData {
  connected: boolean;
  shopId?: string;
  shopDomain?: string;
  shopName?: string;
  currency?: string;
  connectedAt?: string;
  lastSyncedAt?: string;
}

export interface ShopifyMetricsData {
  ordersCount: number;
  totalRevenue: number;
  customersCount: number;
  productsCount: number;
  averageOrderValue: number;
  returningCustomerRate?: number;
  conversionRate?: number;
  currency: string;
  lastSyncedAt: string;
  revenueTrend?: Array<{ date: string; revenue: number; orders: number }>;
  customerGrowth?: Array<{ date: string; customers: number }>;
  topSellingProducts?: Array<{
    id: string;
    title: string;
    unitsSold: number;
    revenue: number;
    inventory: number;
    productType: string;
  }>;
}

// 15-Minute Auto Refetch Interval (900,000 ms)
const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

export const useMetaStatus = () => {
  return useQuery<MetaStatusData>({
    queryKey: ['metaStatus'],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: MetaStatusData }>('/integrations/meta/status');
      return response.data.data;
    },
    staleTime: FIFTEEN_MINUTES_MS,
    refetchInterval: FIFTEEN_MINUTES_MS,
  });
};

export const useMetaInsights = () => {
  return useQuery<MetaInsightsData>({
    queryKey: ['metaInsights'],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: MetaInsightsData }>('/integrations/meta/insights');
      return response.data.data;
    },
    staleTime: FIFTEEN_MINUTES_MS,
    refetchInterval: FIFTEEN_MINUTES_MS,
    retry: 1,
  });
};

export const useShopifyStatus = () => {
  return useQuery<ShopifyStatusData>({
    queryKey: ['shopifyStatus'],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: ShopifyStatusData }>('/integrations/shopify/status');
      return response.data.data;
    },
    staleTime: FIFTEEN_MINUTES_MS,
    refetchInterval: FIFTEEN_MINUTES_MS,
  });
};

export const useShopifyMetrics = () => {
  return useQuery<ShopifyMetricsData>({
    queryKey: ['shopifyMetrics'],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: ShopifyMetricsData }>('/integrations/shopify/orders');
      return response.data.data;
    },
    staleTime: FIFTEEN_MINUTES_MS,
    refetchInterval: FIFTEEN_MINUTES_MS,
    retry: 1,
  });
};

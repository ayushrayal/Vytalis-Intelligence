import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { apiClient, API_BASE_URL } from '../../services/api.client';
import { ShopifyDomainModal } from '../../components/ShopifyDomainModal/ShopifyDomainModal';
import { MetaAccountModal, IMetaSimpleAccount } from '../../components/MetaAccountModal/MetaAccountModal';
import {
  Zap,
  LogOut,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  Layers,
  DollarSign,
  Users,
  Eye,
  Activity,
  MousePointer,
  Percent,
  ShoppingBag,
  TrendingUp,
  Award,
} from 'lucide-react';
import './DashboardPage.scss';

interface MetaStatus {
  connected: boolean;
  adAccountId?: string;
  adAccountName?: string;
  connectedAt?: string;
  lastSyncedAt?: string;
  tokenExpiresAt?: string;
  isExpired?: boolean;
  hasToken?: boolean;
}

interface MetaInsights {
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

export const DashboardPage: React.FC = () => {
  const { user, logout, checkAuth } = useAuth();
  const [isShopifyModalOpen, setIsShopifyModalOpen] = useState<boolean>(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [loadingAccounts, setLoadingAccounts] = useState<boolean>(false);
  const [metaAccounts, setMetaAccounts] = useState<IMetaSimpleAccount[]>([]);

  const [metaStatus, setMetaStatus] = useState<MetaStatus>({
    connected: false,
  });
  const [metaInsights, setMetaInsights] = useState<MetaInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState<boolean>(false);

  const [shopifyStatus, setShopifyStatus] = useState<{ connected: boolean; shopDomain: string }>({
    connected: false,
    shopDomain: '',
  });

  const fetchMetaInsights = async () => {
    setInsightsLoading(true);
    try {
      const res = await apiClient.get<{ success: boolean; data: MetaInsights }>('/integrations/meta/insights');
      setMetaInsights(res.data.data);
    } catch {
      setMetaInsights(null);
    } finally {
      setInsightsLoading(false);
    }
  };

  const fetchStatuses = async () => {
    try {
      const [metaRes, shopifyRes] = await Promise.all([
        apiClient.get<{ success: boolean; data: MetaStatus }>('/integrations/meta/status'),
        apiClient.get<{ connected: boolean; shopDomain: string }>('/shopify/status'),
      ]);

      const statusData = metaRes.data.data;
      console.log('[Dashboard] Meta Status:', metaRes.data);
      setMetaStatus(statusData);
      setShopifyStatus(shopifyRes.data);

      if (statusData.connected) {
        fetchMetaInsights();
      }
    } catch {
      if (user) {
        setMetaStatus({
          connected: !!user.meta?.connected,
          adAccountId: user.meta?.adAccountId,
          adAccountName: user.meta?.adAccountName,
          lastSyncedAt: user.meta?.lastSyncedAt?.toString(),
        });
        setShopifyStatus({
          connected: !!user.shopify?.connected,
          shopDomain: user.shopify?.shopDomain || '',
        });
      }
    }
  };

  const openAccountSelector = async () => {
    setIsAccountModalOpen(true);
    setLoadingAccounts(true);
    try {
      const res = await apiClient.get<{ success: boolean; data: IMetaSimpleAccount[] }>('/integrations/meta/accounts');
      setMetaAccounts(res.data.data || []);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to fetch Meta Ad Accounts');
      setIsAccountModalOpen(false);
    } finally {
      setLoadingAccounts(false);
    }
  };

  useEffect(() => {
    fetchStatuses();

    // Check if coming back from Meta OAuth redirect
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('meta') === 'oauth_complete') {
      openAccountSelector();
    }
  }, [user]);

  const handleConnectMeta = () => {
    window.location.href = `${API_BASE_URL}/integrations/meta/connect`;
  };

  const handleSelectAccount = async (account: IMetaSimpleAccount) => {
    try {
      await apiClient.post('/integrations/meta/select-account', {
        adAccountId: account.id,
        adAccountName: account.name,
      });
      setIsAccountModalOpen(false);
      await fetchStatuses();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to select Ad Account');
    }
  };

  const handleConnectShopify = (domain: string) => {
    setIsShopifyModalOpen(false);
    window.location.href = `/api/v1/shopify/connect?shop=${encodeURIComponent(domain)}`;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('en-US').format(val);
  };

  const getTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Just now';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins === 1) return '1 minute ago';
    if (mins < 60) return `${mins} minutes ago`;
    const hours = Math.floor(mins / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="brand">
          <Zap className="icon" />
          <span>Vytalis Intelligence Matrix</span>
        </div>
        <div className="user-controls">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="avatar" />
          ) : (
            <div className="avatar-placeholder">{user?.name?.charAt(0) || 'U'}</div>
          )}
          <div className="user-info">
            <span className="name">{user?.name}</span>
            <span className="email">{user?.email}</span>
          </div>
          <button onClick={logout} className="logout-button" id="dashboard-logout-btn">
            <LogOut className="btn-icon" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <main className="dashboard-body">
        <div className="welcome-banner">
          <div className="banner-left">
            <h2>Phase 3: Meta Marketing Intelligence</h2>
            <p>
              Account: <strong>{user?.email}</strong> • Plan: <span className="plan-badge">{user?.subscription?.plan?.toUpperCase()}</span>
            </p>
          </div>

          <button onClick={() => { checkAuth(); fetchStatuses(); }} className="refresh-btn" id="dashboard-refresh-status-btn">
            <RefreshCw size={14} />
            <span>Refresh Status</span>
          </button>
        </div>

        <div className="integrations-grid">
          {/* META CONNECTION CARD */}
          <div className={`integration-card ${metaStatus.connected ? 'connected' : 'disconnected'}`}>
            <div className="card-top">
              <div className="brand-badge meta">
                <svg className="meta-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
                </svg>
              </div>

              <div className="status-pill">
                {metaStatus.connected ? (
                  <>
                    <CheckCircle2 size={14} className="status-icon connected" />
                    <span>Connected</span>
                  </>
                ) : metaStatus.isExpired ? (
                  <>
                    <AlertCircle size={14} className="status-icon disconnected" />
                    <span>Session Expired</span>
                  </>
                ) : metaStatus.hasToken && !metaStatus.adAccountId ? (
                  <>
                    <Layers size={14} className="status-icon connected" />
                    <span>Select Account</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={14} className="status-icon disconnected" />
                    <span>Not Connected</span>
                  </>
                )}
              </div>
            </div>

            <div className="card-main">
              <h3>Meta Ads</h3>
              <p className="description">
                OAuth 2.0 Integration with AES-256 encrypted access tokens for Meta Marketing API.
              </p>

              <div className="connection-details">
                <div className="detail-row">
                  <span className="label">Status:</span>
                  <span className="value">
                    {metaStatus.connected ? 'Connected' : metaStatus.isExpired ? 'Session Expired' : 'Not Connected'}
                  </span>
                </div>
                {metaStatus.adAccountName && (
                  <div className="detail-row">
                    <span className="label">Account:</span>
                    <span className="value highlight">{metaStatus.adAccountName}</span>
                  </div>
                )}
                {metaStatus.connected && (
                  <div className="detail-row">
                    <span className="label">Last Synced:</span>
                    <span className="value flex-row">
                      <Clock size={12} style={{ marginRight: 4 }} />
                      {getTimeAgo(metaStatus.lastSyncedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="card-actions">
              {metaStatus.isExpired ? (
                <button onClick={handleConnectMeta} className="connect-btn meta" id="reconnect-meta-btn">
                  Reconnect Meta
                </button>
              ) : metaStatus.hasToken && !metaStatus.adAccountId ? (
                <button onClick={openAccountSelector} className="connect-btn meta" id="select-meta-account-btn">
                  Select Ad Account
                </button>
              ) : (
                <button onClick={handleConnectMeta} className="connect-btn meta" id="connect-meta-btn">
                  {metaStatus.connected ? 'Reconnect Meta' : 'Connect Meta'}
                </button>
              )}
            </div>
          </div>

          {/* SHOPIFY CONNECTION CARD */}
          <div className={`integration-card ${shopifyStatus.connected ? 'connected' : 'disconnected'}`}>
            <div className="card-top">
              <div className="brand-badge shopify">
                <svg className="shopify-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.8 7.3s-1-.3-1.6-.3c-1.5 0-2.3 1-2.9 2.2-.4.8-1 2.2-1 2.2l-1.3-4.8s-.4-1.2-1.3-1.2h-3.2s-1.1 0-1.3 1.1l-2 8.4-1.4-5.6s-.3-1-1.2-1H1.2l-.7 2.4s1 .2 1.6.5c1 .5 1.5 1.5 1.7 2.5l2.7 10.6s.4 1.2 1.5 1.2h6.8s1.2 0 1.5-1.2l5.4-15.6s.4-1.3-.9-1.4z" />
                </svg>
              </div>

              <div className="status-pill">
                {shopifyStatus.connected ? (
                  <>
                    <CheckCircle2 size={14} className="status-icon connected" />
                    <span>Connected</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={14} className="status-icon disconnected" />
                    <span>Not Connected</span>
                  </>
                )}
              </div>
            </div>

            <div className="card-main">
              <h3>Shopify Store</h3>
              <p className="description">
                OAuth 2.0 Integration with AES-256 encrypted offline access tokens for Shopify Admin API.
              </p>

              <div className="connection-details">
                <div className="detail-row">
                  <span className="label">Status:</span>
                  <span className="value">{shopifyStatus.connected ? 'Connected' : 'Not Connected'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Store:</span>
                  <span className="value highlight">{shopifyStatus.shopDomain || 'Not Linked'}</span>
                </div>
              </div>
            </div>

            <div className="card-actions">
              <button onClick={() => setIsShopifyModalOpen(true)} className="connect-btn shopify" id="connect-shopify-btn">
                {shopifyStatus.connected ? 'Reconnect Shopify' : 'Connect Shopify'}
              </button>
            </div>
          </div>
        </div>

        {/* 7-DAY METRICS SECTION WHEN CONNECTED */}
        {metaStatus.connected && metaInsights && (
          <section className="metrics-section">
            <div className="metrics-header">
              <div className="header-title">
                <TrendingUp className="icon" />
                <h3>7-Day Performance Analytics</h3>
              </div>
              {metaInsights.cached && <span className="cache-badge">⚡ Cached (15m)</span>}
            </div>

            {insightsLoading ? (
              <div className="metrics-loading">
                <div className="spinner"></div>
                <span>Fetching latest Meta Insights...</span>
              </div>
            ) : (
              <div className="metrics-grid">
                {/* SPEND */}
                <div className="metric-card">
                  <div className="metric-icon-box spend">
                    <DollarSign size={20} />
                  </div>
                  <div className="metric-content">
                    <span className="metric-label">Spend</span>
                    <span className="metric-value">{formatCurrency(metaInsights.spend)}</span>
                  </div>
                </div>

                {/* REACH */}
                <div className="metric-card">
                  <div className="metric-icon-box reach">
                    <Users size={20} />
                  </div>
                  <div className="metric-content">
                    <span className="metric-label">Reach</span>
                    <span className="metric-value">{formatNumber(metaInsights.reach)}</span>
                  </div>
                </div>

                {/* IMPRESSIONS */}
                <div className="metric-card">
                  <div className="metric-icon-box impressions">
                    <Eye size={20} />
                  </div>
                  <div className="metric-content">
                    <span className="metric-label">Impressions</span>
                    <span className="metric-value">{formatNumber(metaInsights.impressions)}</span>
                  </div>
                </div>

                {/* FREQUENCY */}
                <div className="metric-card">
                  <div className="metric-icon-box frequency">
                    <Activity size={20} />
                  </div>
                  <div className="metric-content">
                    <span className="metric-label">Frequency</span>
                    <span className="metric-value">{metaInsights.frequency}</span>
                  </div>
                </div>

                {/* CLICKS */}
                <div className="metric-card">
                  <div className="metric-icon-box clicks">
                    <MousePointer size={20} />
                  </div>
                  <div className="metric-content">
                    <span className="metric-label">Clicks</span>
                    <span className="metric-value">{formatNumber(metaInsights.clicks)}</span>
                  </div>
                </div>

                {/* CTR */}
                <div className="metric-card">
                  <div className="metric-icon-box ctr">
                    <Percent size={20} />
                  </div>
                  <div className="metric-content">
                    <span className="metric-label">CTR</span>
                    <span className="metric-value">{metaInsights.ctr}%</span>
                  </div>
                </div>

                {/* PURCHASES */}
                <div className="metric-card">
                  <div className="metric-icon-box purchases">
                    <ShoppingBag size={20} />
                  </div>
                  <div className="metric-content">
                    <span className="metric-label">Purchases</span>
                    <span className="metric-value">{formatNumber(metaInsights.purchases)}</span>
                  </div>
                </div>

                {/* REVENUE */}
                <div className="metric-card">
                  <div className="metric-icon-box revenue">
                    <TrendingUp size={20} />
                  </div>
                  <div className="metric-content">
                    <span className="metric-label">Revenue</span>
                    <span className="metric-value">{formatCurrency(metaInsights.revenue)}</span>
                  </div>
                </div>

                {/* ROAS */}
                <div className="metric-card highlight">
                  <div className="metric-icon-box roas">
                    <Award size={20} />
                  </div>
                  <div className="metric-content">
                    <span className="metric-label">ROAS</span>
                    <span className="metric-value">{metaInsights.roas}x</span>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      <MetaAccountModal
        isOpen={isAccountModalOpen}
        accounts={metaAccounts}
        loading={loadingAccounts}
        onClose={() => setIsAccountModalOpen(false)}
        onSelectAccount={handleSelectAccount}
      />

      <ShopifyDomainModal
        isOpen={isShopifyModalOpen}
        onClose={() => setIsShopifyModalOpen(false)}
        onContinue={handleConnectShopify}
      />
    </div>
  );
};

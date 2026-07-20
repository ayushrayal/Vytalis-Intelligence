import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { apiClient } from '../../services/api.client';
import { ShopifyDomainModal } from '../../components/ShopifyDomainModal/ShopifyDomainModal';
import { Zap, LogOut, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import './DashboardPage.scss';

export const DashboardPage: React.FC = () => {
  const { user, logout, checkAuth } = useAuth();
  const [isShopifyModalOpen, setIsShopifyModalOpen] = useState<boolean>(false);
  const [metaStatus, setMetaStatus] = useState<{ connected: boolean; adAccounts: number }>({
    connected: false,
    adAccounts: 0,
  });
  const [shopifyStatus, setShopifyStatus] = useState<{ connected: boolean; shopDomain: string }>({
    connected: false,
    shopDomain: '',
  });

  const fetchStatuses = async () => {
    try {
      const [metaRes, shopifyRes] = await Promise.all([
        apiClient.get<{ connected: boolean; adAccounts: number }>('/meta/status'),
        apiClient.get<{ connected: boolean; shopDomain: string }>('/shopify/status'),
      ]);
      setMetaStatus(metaRes.data);
      setShopifyStatus(shopifyRes.data);
    } catch {
      // Fallback to user context values
      if (user) {
        setMetaStatus({
          connected: !!user.meta?.connected,
          adAccounts: user.meta?.adAccounts?.length || 0,
        });
        setShopifyStatus({
          connected: !!user.shopify?.connected,
          shopDomain: user.shopify?.shopDomain || '',
        });
      }
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, [user]);

  const handleConnectMeta = () => {
    window.location.href = '/api/v1/meta/connect';
  };

  const handleConnectShopify = (domain: string) => {
    setIsShopifyModalOpen(false);
    window.location.href = `/api/v1/shopify/connect?shop=${encodeURIComponent(domain)}`;
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
            <h2>Phase 3: Connection Status Matrix</h2>
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
                OAuth 2.0 Integration with AES-256 encrypted long-lived tokens for Meta Marketing API.
              </p>

              <div className="connection-details">
                <div className="detail-row">
                  <span className="label">Status:</span>
                  <span className="value">{metaStatus.connected ? 'Connected' : 'Not Connected'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Ad Accounts:</span>
                  <span className="value highlight">{metaStatus.adAccounts}</span>
                </div>
              </div>
            </div>

            <div className="card-actions">
              <button
                onClick={handleConnectMeta}
                className="connect-btn meta"
                id="connect-meta-btn"
              >
                {metaStatus.connected ? 'Reconnect Meta' : 'Connect Meta'}
              </button>
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
              <button
                onClick={() => setIsShopifyModalOpen(true)}
                className="connect-btn shopify"
                id="connect-shopify-btn"
              >
                {shopifyStatus.connected ? 'Reconnect Shopify' : 'Connect Shopify'}
              </button>
            </div>
          </div>
        </div>
      </main>

      <ShopifyDomainModal
        isOpen={isShopifyModalOpen}
        onClose={() => setIsShopifyModalOpen(false)}
        onContinue={handleConnectShopify}
      />
    </div>
  );
};

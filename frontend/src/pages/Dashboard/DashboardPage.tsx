import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Zap, LogOut, CheckCircle, Store, Radio } from 'lucide-react';
import './DashboardPage.scss';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="brand">
          <Zap className="icon" />
          <span>Vytalis Matrix</span>
        </div>
        <div className="user-controls">
          {user?.avatar && <img src={user.avatar} alt={user.name} className="avatar" />}
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
          <h2>Intelligence Matrix Active</h2>
          <p>Logged in as {user?.email} • Plan: <span className="plan-badge">{user?.subscription?.plan.toUpperCase()}</span></p>
        </div>

        <div className="metrics-grid">
          <div className="metric-card">
            <div className="card-header">
              <CheckCircle className="icon success" />
              <span>Authentication Status</span>
            </div>
            <div className="card-value">Authenticated (HttpOnly Cookies)</div>
            <div className="card-footer">Session TTL: 7 Days (Redis Token Hash)</div>
          </div>

          <div className="metric-card">
            <div className="card-header">
              <Store className="icon primary" />
              <span>Connected Shopify Stores</span>
            </div>
            <div className="card-value">
              {user?.connectedAccounts?.shopifyConnected ? '1 Active Store' : '0 Connected'}
            </div>
            <div className="card-footer">Phase 3 Integration Ready</div>
          </div>

          <div className="metric-card">
            <div className="card-header">
              <Radio className="icon warning" />
              <span>Meta Ad Accounts</span>
            </div>
            <div className="card-value">
              {user?.connectedAccounts?.metaConnected ? 'Connected' : 'Not Linked'}
            </div>
            <div className="card-footer">Phase 3 Integration Ready</div>
          </div>
        </div>
      </main>
    </div>
  );
};

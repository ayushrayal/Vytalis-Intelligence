import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { PricingPage } from '../Pricing/PricingPage';
import { CheckCircle2, Circle } from 'lucide-react';

export const WelcomePage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="welcome-hub-container">
      {/* Onboarding Header Banner */}
      <header className="onboarding-banner">
        <div className="banner-content">
          <div className="user-badge">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="user-avatar" />
            ) : (
              <div className="user-avatar-placeholder">{user?.name?.charAt(0) || 'U'}</div>
            )}
            <div className="user-details">
              <h2 className="welcome-title">Welcome to Vytalis Intelligence, {user?.name?.split(' ')[0] || 'Partner'}! 👋</h2>
              <p className="user-email">{user?.email}</p>
            </div>
          </div>

          <button onClick={logout} className="signout-button" id="onboarding-signout-btn">
            Sign Out
          </button>
        </div>

        {/* 4-Step Onboarding Steps Progress Bar */}
        <div className="onboarding-steps-bar">
          <div className="step-item active">
            <CheckCircle2 className="step-icon active" />
            <span>1. Choose Plan</span>
          </div>
          <div className="step-divider" />
          <div className="step-item pending">
            <Circle className="step-icon pending" />
            <span>2. Connect Meta</span>
          </div>
          <div className="step-divider" />
          <div className="step-item pending">
            <Circle className="step-icon pending" />
            <span>3. Connect Shopify</span>
          </div>
          <div className="step-divider" />
          <div className="step-item pending">
            <Circle className="step-icon pending" />
            <span>4. Launch Dashboard</span>
          </div>
        </div>
      </header>

      {/* Embedded Pricing Matrix */}
      <main className="onboarding-hub-main">
        <PricingPage />
      </main>
    </div>
  );
};

export default WelcomePage;

import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ShieldCheck, Sparkles, Zap, ArrowRight } from 'lucide-react';
import './LoginPage.scss';

export const LoginPage: React.FC = () => {
  const { user, isAuthenticated, login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const errorParam = searchParams.get('error');

  useEffect(() => {
    if (isAuthenticated && user) {
      const target = user.isOnboarded ? '/dashboard' : '/welcome';
      console.log('[LoginPage] Authenticated user | isOnboarded:', user.isOnboarded, '| Navigating to:', target);
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="login-container">
      <div className="login-backdrop" />
      <div className="login-card">
        <div className="brand-header">
          <div className="logo-badge">
            <Zap className="logo-icon" />
          </div>
          <h1 className="brand-title">Vytalis Intelligence</h1>
          <p className="brand-subtitle">AI-Powered Enterprise Ad & Revenue Intelligence</p>
        </div>

        {errorParam && (
          <div className="error-banner">
            <span>Authentication error: {errorParam.replace(/_/g, ' ')}</span>
          </div>
        )}

        <div className="auth-action-box">
          <p className="auth-instructions">Sign in or create an account to access your intelligence matrix.</p>

          <button
            onClick={login}
            disabled={isLoading}
            className="google-btn"
            id="google-oauth-login-btn"
          >
            <svg className="google-icon" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
            <ArrowRight className="arrow-icon" />
          </button>
        </div>

        <div className="security-badges">
          <div className="badge-item">
            <ShieldCheck className="badge-icon" />
            <span>256-bit Encrypted Session</span>
          </div>
          <div className="badge-item">
            <Sparkles className="badge-icon" />
            <span>Google OAuth 2.0 Only</span>
          </div>
        </div>
      </div>
    </div>
  );
};

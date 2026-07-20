import React, { ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';
import './AuthGuard.scss';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireOnboarded?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback = null,
  requireOnboarded = false,
}) => {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="auth-guard-loader">
        <div className="spinner" />
        <p>Verifying authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return fallback ? <>{fallback}</> : null;
  }

  if (requireOnboarded && !user.isOnboarded) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children?: ReactNode;
  requireOnboarded?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireOnboarded = true,
}) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#090d16',
          color: '#94a3b8',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(99, 102, 241, 0.2)',
            borderTopColor: '#6366f1',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            marginBottom: '16px',
          }}
        />
        <p style={{ fontSize: '14px', letterSpacing: '0.05em' }}>Authenticating Vytalis Session...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    console.log('[ProtectedRoute] Unauthenticated | Redirecting to /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireOnboarded && !user.isOnboarded) {
    console.log('[ProtectedRoute] User not onboarded (isOnboarded: false) | Redirecting from', location.pathname, 'to /welcome');
    return <Navigate to="/welcome" replace />;
  }

  if (!requireOnboarded && user.isOnboarded && location.pathname === '/welcome') {
    console.log('[ProtectedRoute] User already onboarded (isOnboarded: true) | Redirecting from /welcome to /dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

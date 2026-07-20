import React, { ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-400 font-medium">Verifying authentication...</p>
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

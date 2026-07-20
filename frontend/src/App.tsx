import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/Landing/Landing';
import { LoginPage } from './pages/Login/LoginPage';
import { WelcomePage } from './pages/Welcome/WelcomePage';
import { PricingPage } from './pages/Pricing/PricingPage';

// Lazy Loaded Dashboard Routes
const DashboardPage = lazy(() => import('./pages/Dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const MetaIntelligencePage = lazy(() => import('./pages/Meta/MetaIntelligencePage').then((m) => ({ default: m.MetaIntelligencePage })));
const ShopifyIntelligencePage = lazy(() => import('./pages/Shopify/ShopifyIntelligencePage').then((m) => ({ default: m.ShopifyIntelligencePage })));
const SettingsPage = lazy(() => import('./pages/Settings/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const ComingSoonPage = lazy(() => import('./pages/ComingSoon/ComingSoonPage').then((m) => ({ default: m.ComingSoonPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 15 * 60 * 1000, // 15 Minutes Stale Time
      retry: 1,
    },
  },
});

const RouteLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
  </div>
);

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/pricing" element={<PricingPage />} />

            {/* Onboarding Route */}
            <Route
              path="/welcome"
              element={
                <ProtectedRoute requireOnboarded={false}>
                  <WelcomePage />
                </ProtectedRoute>
              }
            />

            {/* Protected Dashboard Shell Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requireOnboarded={true}>
                  <AppLayout>
                    <Suspense fallback={<RouteLoader />}>
                      <DashboardPage />
                    </Suspense>
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/meta"
              element={
                <ProtectedRoute requireOnboarded={true}>
                  <AppLayout>
                    <Suspense fallback={<RouteLoader />}>
                      <MetaIntelligencePage />
                    </Suspense>
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/shopify"
              element={
                <ProtectedRoute requireOnboarded={true}>
                  <AppLayout>
                    <Suspense fallback={<RouteLoader />}>
                      <ShopifyIntelligencePage />
                    </Suspense>
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/creative"
              element={
                <ProtectedRoute requireOnboarded={true}>
                  <AppLayout>
                    <Suspense fallback={<RouteLoader />}>
                      <ComingSoonPage
                        title="Creative Analytics Module"
                        description="Identify high-converting ad visuals, creative decay rates, and visual hook retention scores automatically."
                        moduleType="creative"
                      />
                    </Suspense>
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/ai-insights"
              element={
                <ProtectedRoute requireOnboarded={true}>
                  <AppLayout>
                    <Suspense fallback={<RouteLoader />}>
                      <ComingSoonPage
                        title="AI Predictive Insights"
                        description="Proactive revenue anomalies detection, automated budget reallocation recommendations, and LTV forecasts."
                        moduleType="ai"
                      />
                    </Suspense>
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute requireOnboarded={true}>
                  <AppLayout>
                    <Suspense fallback={<RouteLoader />}>
                      <SettingsPage />
                    </Suspense>
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;

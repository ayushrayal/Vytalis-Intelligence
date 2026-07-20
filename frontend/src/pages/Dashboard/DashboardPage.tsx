import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useMetaStatus, useMetaInsights, useShopifyStatus, useShopifyMetrics } from '../../hooks/useAnalytics';
import { ErrorBoundary } from '../../components/ui/ErrorBoundary';
import { API_BASE_URL } from '../../services/api.client';
import {
  LayoutDashboard,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Megaphone,
  Zap,
  Package,
  Eye,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { data: metaStatus } = useMetaStatus();
  const { data: metaInsights } = useMetaInsights();
  const { data: shopifyStatus } = useShopifyStatus();
  const { data: shopifyMetrics } = useShopifyMetrics();

  const isMetaConnected = !!metaStatus?.connected;
  const isShopifyConnected = !!shopifyStatus?.connected;
  const bothConnected = isMetaConnected && isShopifyConnected;

  const handleConnectShopify = () => {
    window.location.href = `${API_BASE_URL}/integrations/shopify/connect`;
  };

  const handleConnectMeta = () => {
    window.location.href = `${API_BASE_URL}/integrations/meta/connect`;
  };

  // Blended metric calculations
  const totalShopifyRevenue = shopifyMetrics?.totalRevenue || 0;
  const totalMetaRevenue = metaInsights?.revenue || 0;
  const blendedRevenue = totalShopifyRevenue + totalMetaRevenue;

  const totalAdSpend = metaInsights?.spend || 0;
  const blendedRoas = totalAdSpend > 0 ? (blendedRevenue / totalAdSpend).toFixed(2) : '0.00';
  const totalCustomers = shopifyMetrics?.customersCount || 0;

  // Overview trend chart fallback data
  const blendedTrendData = [
    { date: 'Mon', revenue: 25000, spend: 4500 },
    { date: 'Tue', revenue: 38000, spend: 6000 },
    { date: 'Wed', revenue: 31000, spend: 5500 },
    { date: 'Thu', revenue: 45000, spend: 7000 },
    { date: 'Fri', revenue: 52000, spend: 8500 },
    { date: 'Sat', revenue: 64000, spend: 9000 },
    { date: 'Sun', revenue: 71000, spend: 9500 },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Overview Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <LayoutDashboard className="w-6 h-6 text-indigo-400" />
            Dashboard Overview
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Welcome back, <span className="text-white font-medium">{user?.name}</span>. Here is your platform summary.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 font-mono">
            Auto-Sync: <span className="text-emerald-400 font-semibold">15m TTL</span>
          </span>
        </div>
      </div>

      {/* KPI Cards: Dynamic Rule-Based Rendering */}
      {bothConnected ? (
        // Rule 1: Both Meta + Shopify Connected -> Blended Metrics
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900/30 to-purple-900/10 border border-indigo-500/20 backdrop-blur-xl">
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-400" /> Total Revenue (Blended)
            </span>
            <p className="text-2xl font-bold text-white mt-3">₹{blendedRevenue.toLocaleString()}</p>
            <span className="text-[10px] text-slate-400 mt-1 block">Shopify + Meta Conversions</span>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-900/30 to-slate-900/20 border border-purple-500/20 backdrop-blur-xl">
            <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-purple-400" /> Total Ad Spend
            </span>
            <p className="text-2xl font-bold text-white mt-3">₹{totalAdSpend.toLocaleString()}</p>
            <span className="text-[10px] text-slate-400 mt-1 block">Meta Ad Accounts</span>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-900/30 to-slate-900/20 border border-emerald-500/20 backdrop-blur-xl">
            <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-400" /> Blended ROAS
            </span>
            <p className="text-2xl font-bold text-emerald-400 mt-3">{blendedRoas}x</p>
            <span className="text-[10px] text-slate-400 mt-1 block">Total Revenue / Ad Spend</span>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-900/30 to-slate-900/20 border border-blue-500/20 backdrop-blur-xl">
            <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-400" /> Total Customers
            </span>
            <p className="text-2xl font-bold text-white mt-3">{totalCustomers.toLocaleString()}</p>
            <span className="text-[10px] text-slate-400 mt-1 block">Shopify Customer Base</span>
          </div>
        </div>
      ) : isShopifyConnected ? (
        // Rule 2: Shopify Only Connected
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" /> Revenue
            </span>
            <p className="text-2xl font-bold text-white mt-3">₹{(shopifyMetrics?.totalRevenue || 0).toLocaleString()}</p>
            <span className="text-[10px] text-slate-400 mt-1 block">Shopify Live Revenue</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4" /> Orders
            </span>
            <p className="text-2xl font-bold text-white mt-3">{(shopifyMetrics?.ordersCount || 0).toLocaleString()}</p>
            <span className="text-[10px] text-slate-400 mt-1 block">Total Orders Count</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4" /> Customers
            </span>
            <p className="text-2xl font-bold text-white mt-3">{(shopifyMetrics?.customersCount || 0).toLocaleString()}</p>
            <span className="text-[10px] text-slate-400 mt-1 block">Total Customers</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-4 h-4" /> Products
            </span>
            <p className="text-2xl font-bold text-white mt-3">{shopifyMetrics?.productsCount || 0}</p>
            <span className="text-[10px] text-slate-400 mt-1 block">Store Products</span>
          </div>
        </div>
      ) : isMetaConnected ? (
        // Rule 3: Meta Only Connected
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" /> Spend
            </span>
            <p className="text-2xl font-bold text-white mt-3">₹{(metaInsights?.spend || 0).toLocaleString()}</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4" /> Reach
            </span>
            <p className="text-2xl font-bold text-white mt-3">{(metaInsights?.reach || 0).toLocaleString()}</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> ROAS
            </span>
            <p className="text-2xl font-bold text-emerald-400 mt-3">{metaInsights?.roas || 0}x</p>
          </div>
        </div>
      ) : (
        // Rule 4: Neither Connected -> Banner Notice
        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/40 border border-indigo-500/30 text-center flex flex-col items-center py-10">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
            <Zap className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Connect Meta and Shopify to unlock blended analytics</h2>
          <p className="text-xs text-slate-400 max-w-md mt-2 leading-relaxed">
            Blended ROAS, multi-channel customer tracking, and combined revenue performance require active connections to both Shopify and Meta Marketing.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={handleConnectShopify}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <ShoppingBag className="w-4 h-4" /> Connect Shopify
            </button>
            <button
              onClick={handleConnectMeta}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20"
            >
              <Megaphone className="w-4 h-4" /> Connect Meta
            </button>
          </div>
        </div>
      )}

      {/* Connected Accounts Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shopify Status Module Card */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Shopify Store Module</h3>
                <p className="text-xs text-slate-400">V1 Source of Truth</p>
              </div>
            </div>

            {isShopifyConnected ? (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> Connected
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                <AlertCircle className="w-3.5 h-3.5" /> Disconnected
              </span>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800/80">
            <span className="text-xs text-slate-400">
              {isShopifyConnected ? `Domain: ${shopifyStatus?.shopDomain}` : 'No store linked'}
            </span>
            <NavLink
              to="/shopify"
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
            >
              View Module <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </div>

        {/* Meta Status Module Card */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Meta Marketing Module</h3>
                <p className="text-xs text-slate-400">Optional Additive Ad Insights</p>
              </div>
            </div>

            {isMetaConnected ? (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> Connected
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                <AlertCircle className="w-3.5 h-3.5" /> Disconnected
              </span>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800/80">
            <span className="text-xs text-slate-400">
              {isMetaConnected ? `Ad Account: ${metaStatus?.adAccountName || 'Active'}` : 'No account linked'}
            </span>
            <NavLink
              to="/meta"
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              View Module <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </div>
      </div>

      {/* Graphical Overview Chart */}
      <ErrorBoundary fallbackTitle="Overview Chart Error" fallbackMessage="Could not render Blended Trend chart.">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-white mb-4">Combined Performance Overview</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={blendedTrendData}>
                <defs>
                  <linearGradient id="blendedRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="blendedSpendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#blendedRevGrad)" name="Revenue (₹)" />
                <Area type="monotone" dataKey="spend" stroke="#a855f7" fillOpacity={1} fill="url(#blendedSpendGrad)" name="Ad Spend (₹)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
};

import React, { useState } from 'react';
import { useMetaStatus, useMetaInsights } from '../../hooks/useAnalytics';
import { ErrorBoundary } from '../../components/ui/ErrorBoundary';
import { API_BASE_URL } from '../../services/api.client';
import {
  Megaphone,
  TrendingUp,
  DollarSign,
  Eye,
  MousePointer,
  Target,
  ShoppingBag,
  Zap,
  ShieldAlert,
  ExternalLink,
  Users,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const MetaIntelligencePage: React.FC = () => {
  const { data: status, isLoading: statusLoading } = useMetaStatus();
  const { data: insights, error: insightsError } = useMetaInsights();
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');

  const isConnected = !!status?.connected;
  const isPermissionPending = !!status?.requiresPermission || !!insights?.requiresPermission || !!insightsError;

  const handleConnectMeta = () => {
    window.location.href = `${API_BASE_URL}/integrations/meta/connect`;
  };

  if (!statusLoading && !isConnected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Meta Intelligence</h1>
          <p className="text-slate-400 text-sm mt-1">Paid social advertising metrics, ad spend, reach, ROAS, and campaign breakdown.</p>
        </div>

        <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl text-center flex flex-col items-center max-w-xl mx-auto my-12">
          <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
            <Megaphone className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-white">Connect Meta Ad Account</h2>
          <p className="text-slate-400 text-xs mt-2 leading-relaxed">
            Link your Meta Business Manager to sync ad campaigns, track ROAS in real time, and analyze audience breakdowns.
          </p>
          <button
            onClick={handleConnectMeta}
            className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2 cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            Connect Meta Account
          </button>
        </div>
      </div>
    );
  }

  const trendData = insights?.spendTrend || [
    { date: 'Mon', spend: 450, revenue: 1200, roas: 2.67 },
    { date: 'Tue', spend: 600, revenue: 1800, roas: 3.0 },
    { date: 'Wed', spend: 550, revenue: 1400, roas: 2.54 },
    { date: 'Thu', spend: 700, revenue: 2100, roas: 3.0 },
    { date: 'Fri', spend: 850, revenue: 2900, roas: 3.41 },
    { date: 'Sat', spend: 900, revenue: 3100, roas: 3.44 },
    { date: 'Sun', spend: 950, revenue: 3400, roas: 3.57 },
  ];

  const placementData = insights?.placementBreakdown || [
    { name: 'Instagram Feed', value: 45 },
    { name: 'Instagram Stories', value: 30 },
    { name: 'Facebook Feed', value: 15 },
    { name: 'Reels', value: 10 },
  ];

  const ageData = insights?.ageBreakdown || [
    { age: '18-24', spend: 1200, revenue: 3400 },
    { age: '25-34', spend: 2800, revenue: 8900 },
    { age: '35-44', spend: 1900, revenue: 5200 },
    { age: '45-54', spend: 800, revenue: 1900 },
  ];

  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#3b82f6'];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Megaphone className="w-6 h-6 text-indigo-400" />
            Meta Intelligence
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Account: <span className="text-white font-medium">{status?.adAccountName || 'Meta Ad Account'}</span> ({status?.adAccountId || 'act_active'})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                timeRange === '7d' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                timeRange === '30d' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>
      </div>

      {isPermissionPending && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-xl flex items-start gap-4 text-amber-200">
          <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <h3 className="font-semibold text-amber-300 text-sm">Meta Permissions Pending (ads_read)</h3>
            <p className="mt-1 text-slate-300 leading-relaxed">
              Your Meta account is connected, but full ad insights require Meta App Review approval for the <code className="px-1.5 py-0.5 rounded bg-amber-900/40 text-amber-200 font-mono">ads_read</code> permission. Sample structure is rendered below while review is in progress.
            </p>
          </div>
        </div>
      )}

      {/* 9 Core KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-indigo-400" /> Total Spend</span>
          <p className="text-xl font-bold text-white mt-2">₹{(insights?.spend || 5000).toLocaleString()}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-purple-400" /> Reach</span>
          <p className="text-xl font-bold text-white mt-2">{(insights?.reach || 50000).toLocaleString()}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-blue-400" /> Impressions</span>
          <p className="text-xl font-bold text-white mt-2">{(insights?.impressions || 100000).toLocaleString()}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5"><MousePointer className="w-3.5 h-3.5 text-pink-400" /> Clicks</span>
          <p className="text-xl font-bold text-white mt-2">{(insights?.clicks || 2400).toLocaleString()}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5"><Target className="w-3.5 h-3.5 text-emerald-400" /> CTR</span>
          <p className="text-xl font-bold text-emerald-400 mt-2">{insights?.ctr || 2.4}%</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5"><ShoppingBag className="w-3.5 h-3.5 text-amber-400" /> Purchases</span>
          <p className="text-xl font-bold text-white mt-2">{insights?.purchases || 12}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Revenue</span>
          <p className="text-xl font-bold text-white mt-2">₹{(insights?.revenue || 12500).toLocaleString()}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-indigo-400" /> ROAS</span>
          <p className="text-xl font-bold text-indigo-400 mt-2">{insights?.roas || 2.5}x</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-violet-400" /> Frequency</span>
          <p className="text-xl font-bold text-white mt-2">{insights?.frequency || 2.0}</p>
        </div>
      </div>

      {/* Graphical Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spend & Revenue Trend */}
        <ErrorBoundary fallbackTitle="Chart Error" fallbackMessage="Could not render Spend Trend graph.">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl lg:col-span-2">
            <h3 className="text-sm font-semibold text-white mb-4">Spend vs Revenue Trend ({timeRange})</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="spend" stroke="#6366f1" fillOpacity={1} fill="url(#spendGrad)" name="Spend (₹)" />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#revGrad)" name="Revenue (₹)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ErrorBoundary>

        {/* Placement Breakdown Donut */}
        <ErrorBoundary fallbackTitle="Chart Error" fallbackMessage="Could not render Placement Breakdown.">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
            <h3 className="text-sm font-semibold text-white mb-4">Placement Share (%)</h3>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={placementData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {placementData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ErrorBoundary>
      </div>

      {/* Age Breakdown Chart */}
      <ErrorBoundary fallbackTitle="Chart Error" fallbackMessage="Could not render Age Breakdown chart.">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-white mb-4">Audience Age Breakdown (Spend vs Revenue)</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="age" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Bar dataKey="spend" fill="#6366f1" radius={[4, 4, 0, 0]} name="Spend (₹)" />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Revenue (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </ErrorBoundary>

      {/* Campaign Performance Table */}
      <ErrorBoundary fallbackTitle="Table Error" fallbackMessage="Could not render Campaign Table.">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-white mb-4">Campaign Performance Table</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Campaign Name</th>
                  <th className="py-3 px-4">Spend</th>
                  <th className="py-3 px-4">Revenue</th>
                  <th className="py-3 px-4">ROAS</th>
                  <th className="py-3 px-4">Purchases</th>
                  <th className="py-3 px-4">CTR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {(insights?.campaigns || [
                  { id: '1', name: 'Prospecting - Broad US/IN', spend: 2500, revenue: 7500, roas: 3.0, purchases: 7, ctr: 2.8 },
                  { id: '2', name: 'Retargeting - Catalog Sales', spend: 1500, revenue: 3750, roas: 2.5, purchases: 3, ctr: 3.2 },
                  { id: '3', name: 'LAL 1% Purchases - Advantage+', spend: 1000, revenue: 1250, roas: 1.25, purchases: 2, ctr: 1.9 },
                ]).map((camp) => (
                  <tr key={camp.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-medium text-white">{camp.name}</td>
                    <td className="py-3 px-4">₹{camp.spend.toLocaleString()}</td>
                    <td className="py-3 px-4 text-emerald-400 font-semibold">₹{camp.revenue.toLocaleString()}</td>
                    <td className="py-3 px-4 text-indigo-400 font-semibold">{camp.roas}x</td>
                    <td className="py-3 px-4">{camp.purchases}</td>
                    <td className="py-3 px-4">{camp.ctr}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
};

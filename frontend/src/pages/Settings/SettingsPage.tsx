import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useMetaStatus, useShopifyStatus } from '../../hooks/useAnalytics';
import { apiClient, API_BASE_URL } from '../../services/api.client';
import { ShoppingBag, Megaphone, CheckCircle2, AlertCircle, ExternalLink, ShieldCheck } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { checkAuth } = useAuth();
  const { data: metaStatus } = useMetaStatus();
  const { data: shopifyStatus, refetch: refetchShopify } = useShopifyStatus();

  const [shopDomain, setShopDomain] = useState('');
  const [connectingShopify, setConnectingShopify] = useState(false);
  const [disconnectingShopify, setDisconnectingShopify] = useState(false);

  const handleConnectShopify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopDomain) return;
    setConnectingShopify(true);
    window.location.href = `${API_BASE_URL}/integrations/shopify/connect?shop=${encodeURIComponent(shopDomain)}`;
  };

  const handleDisconnectShopify = async () => {
    if (!window.confirm('Are you sure you want to disconnect your Shopify store?')) return;
    setDisconnectingShopify(true);
    try {
      await apiClient.post('/integrations/shopify/disconnect');
      await checkAuth();
      await refetchShopify();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to disconnect Shopify');
    } finally {
      setDisconnectingShopify(false);
    }
  };

  const handleConnectMeta = () => {
    window.location.href = `${API_BASE_URL}/integrations/meta/connect`;
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings & Integrations</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your connected store accounts, Meta marketing credentials, and workspace preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shopify Integration Card */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base">Shopify Store Integration</h3>
                  <p className="text-xs text-slate-400">V1 Primary Analytics Source of Truth</p>
                </div>
              </div>

              {shopifyStatus?.connected ? (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                  <AlertCircle className="w-3.5 h-3.5" /> Disconnected
                </span>
              )}
            </div>

            {shopifyStatus?.connected ? (
              <div className="mt-6 p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Store Name:</span>
                  <span className="text-white font-medium">{shopifyStatus.shopName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Domain:</span>
                  <span className="text-indigo-400 font-mono">{shopifyStatus.shopDomain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Currency:</span>
                  <span className="text-white font-medium">{shopifyStatus.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Last Synced:</span>
                  <span className="text-slate-300">{shopifyStatus.lastSyncedAt ? new Date(shopifyStatus.lastSyncedAt).toLocaleString() : 'Just now'}</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConnectShopify} className="mt-6 space-y-3">
                <label className="block text-xs font-medium text-slate-300">Shopify Domain (.myshopify.com)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="my-store.myshopify.com"
                    value={shopDomain}
                    onChange={(e) => setShopDomain(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={connectingShopify}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                  >
                    Connect
                  </button>
                </div>
              </form>
            )}
          </div>

          {shopifyStatus?.connected && (
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex justify-end">
              <button
                onClick={handleDisconnectShopify}
                disabled={disconnectingShopify}
                className="px-4 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer border border-red-500/20"
              >
                Disconnect Shopify Store
              </button>
            </div>
          )}
        </div>

        {/* Meta Integration Card */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Megaphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base">Meta Marketing Integration</h3>
                  <p className="text-xs text-slate-400">Optional Additive Ad Insights</p>
                </div>
              </div>

              {metaStatus?.connected ? (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                </span>
              ) : metaStatus?.requiresPermission ? (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" /> Permission Required
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                  <AlertCircle className="w-3.5 h-3.5" /> Disconnected
                </span>
              )}
            </div>

            {metaStatus?.connected ? (
              <div className="mt-6 p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Selected Ad Account:</span>
                  <span className="text-white font-medium">{metaStatus.adAccountName || 'Primary Account'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Account ID:</span>
                  <span className="text-indigo-400 font-mono">{metaStatus.adAccountId || 'act_xxxxxx'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Last Synced:</span>
                  <span className="text-slate-300">{metaStatus.lastSyncedAt ? new Date(metaStatus.lastSyncedAt).toLocaleString() : 'Just now'}</span>
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Connect your Meta Business Account to sync ad spend, campaign performance, reach, and ROAS trends.
                </p>
                <button
                  onClick={handleConnectMeta}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  Connect Meta Account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

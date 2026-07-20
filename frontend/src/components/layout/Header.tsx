import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  Search,
  RefreshCw,
  ShoppingBag,
  Megaphone,
  User as UserIcon,
  LogOut,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface HeaderProps {
  onOpenCommandPalette: () => void;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
  lastSyncedText?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCommandPalette,
  onRefreshData,
  isRefreshing = false,
  lastSyncedText = 'Just now',
}) => {
  const { user, logout } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const shopifyConnected = !!user?.connectedAccounts?.shopifyConnected || !!user?.shopify?.connected;
  const metaConnected = !!user?.connectedAccounts?.metaConnected || !!user?.meta?.connected;

  return (
    <header className="fixed top-0 left-72 right-0 h-20 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-8 flex items-center justify-between">
      {/* Left: Command Palette Search Trigger */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all text-xs cursor-pointer group shadow-inner"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
          <span className="flex-1 text-left">Search metrics, campaigns, products...</span>
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-800/90 rounded border border-slate-700">
            <span>⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right Actions: Connection Pills, Sync Action, Profile Dropdown */}
      <div className="flex items-center gap-3">
        {/* Shopify Status Pill */}
        <div
          className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            shopifyConnected
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
          title={shopifyConnected ? 'Shopify Store Connected' : 'Shopify Disconnected'}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Shopify</span>
          {shopifyConnected ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
          )}
        </div>

        {/* Meta Status Pill */}
        <div
          className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            metaConnected
              ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
          title={metaConnected ? 'Meta Account Connected' : 'Meta Disconnected'}
        >
          <Megaphone className="w-3.5 h-3.5" />
          <span>Meta</span>
          {metaConnected ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
          )}
        </div>

        {/* Manual Sync Button */}
        <button
          onClick={onRefreshData}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-all cursor-pointer disabled:opacity-50"
          title="Trigger Sync Now"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline font-medium">Sync Now</span>
          <span className="text-[10px] text-slate-500 font-mono hidden lg:inline">({lastSyncedText})</span>
        </button>

        <div className="h-5 w-px bg-slate-800 mx-1 hidden sm:block" />

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all cursor-pointer"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-lg object-cover ring-2 ring-indigo-500/20" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs shadow-md">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-white leading-tight">{user?.name || 'User'}</span>
              <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{user?.email}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
          </button>

          {/* User Dropdown Menu */}
          {showUserDropdown && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 text-xs text-slate-300 animate-in fade-in slide-in-from-top-2"
              onMouseLeave={() => setShowUserDropdown(false)}
            >
              <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                <p className="font-semibold text-white truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                <span className="mt-1.5 inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Plan: {user?.subscription?.plan || 'Starter'}
                </span>
              </div>

              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    window.location.href = '/settings';
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-800 hover:text-white transition-colors cursor-pointer text-left"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span>Account & Integrations</span>
                </button>

                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

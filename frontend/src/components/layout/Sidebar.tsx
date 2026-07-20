import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Megaphone,
  ShoppingBag,
  Sparkles,
  Palette,
  Settings,
  Zap,
  Activity,
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const location = useLocation();

  const navItems = [
    {
      name: 'Overview',
      path: '/dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'Meta Intelligence',
      path: '/meta',
      icon: Megaphone,
      badge: null,
    },
    {
      name: 'Shopify Intelligence',
      path: '/shopify',
      icon: ShoppingBag,
      badge: 'V1 Live',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      name: 'Creative Analytics',
      path: '/creative',
      icon: Palette,
      badge: 'Soon',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    },
    {
      name: 'AI Insights',
      path: '/ai-insights',
      icon: Sparkles,
      badge: 'Soon',
      badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="fixed top-0 left-0 z-40 w-72 h-screen border-r border-slate-800/80 bg-slate-950/90 backdrop-blur-xl flex flex-col justify-between">
      {/* Top Header / Brand Logo */}
      <div className="flex items-center justify-between h-20 px-6 border-b border-slate-800/60">
        <NavLink to="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              Vytalis <span className="text-indigo-400 font-medium text-xs px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">AI</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Intelligence Platform</span>
          </div>
        </NavLink>
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Modules
        </div>

        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'text-white bg-slate-800/80 shadow-inner'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNavBg"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/10 border border-indigo-500/30"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}

              <Icon
                className={`w-5 h-5 shrink-0 transition-colors z-10 ${
                  isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />

              <div className="flex items-center justify-between flex-1 z-10 truncate">
                <span className="truncate">{item.name}</span>
                {item.badge && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </div>
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Footer Status Card */}
      <div className="p-4 m-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Live Status
          </span>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-semibold">
            Operational
          </span>
        </div>
        <p className="text-[11px] text-slate-500 leading-snug">
          Shopify GraphQL connected. Meta optional.
        </p>
      </div>
    </aside>
  );
};

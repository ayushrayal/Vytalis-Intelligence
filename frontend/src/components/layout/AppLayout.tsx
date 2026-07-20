import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandPalette } from './CommandPalette';
import { ErrorBoundary } from '../ui/ErrorBoundary';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      window.location.reload();
    }, 800);
  };

  return (
    <div className="min-h-screen flex bg-black text-white selection:bg-indigo-500/30 selection:text-indigo-200">
      <Sidebar />
      <div className="flex-1 ml-72">
        <Header
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onRefreshData={handleRefreshData}
          isRefreshing={isRefreshing}
          lastSyncedText="15m auto-sync"
        />
        <main className="p-8 pt-24 max-w-7xl mx-auto">
          <ErrorBoundary fallbackTitle="Module rendering error" fallbackMessage="The current view encountered an issue loading. Please refresh or retry.">
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </ErrorBoundary>
        </main>
      </div>

      {/* Command Palette Modal */}
      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
    </div>
  );
};

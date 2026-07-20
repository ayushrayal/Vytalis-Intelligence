import React from 'react';
import { Activity } from 'lucide-react';
import { Button } from '../Button/Button';

interface NavbarProps {
  onLoginClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLoginClick }) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5 font-bold text-white text-base tracking-tight">
          <Activity className="w-5 h-5 text-indigo-400" />
          <span>Vytalis Intelligence</span>
        </a>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={onLoginClick} id="nav-signin-google-btn">
            Sign In with Google
          </Button>
          <Button variant="primary" size="sm" onClick={onLoginClick} id="nav-start-trial-btn">
            Start 7-Day Free Trial
          </Button>
        </div>
      </div>
    </header>
  );
};

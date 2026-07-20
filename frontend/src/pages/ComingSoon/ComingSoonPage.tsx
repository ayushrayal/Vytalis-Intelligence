import React from 'react';
import { Sparkles, Palette, Bell } from 'lucide-react';

interface ComingSoonPageProps {
  title: string;
  description: string;
  moduleType: 'creative' | 'ai';
}

export const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ title, description, moduleType }) => {
  const Icon = moduleType === 'creative' ? Palette : Sparkles;
  const gradient = moduleType === 'creative' ? 'from-pink-500 via-purple-500 to-indigo-500' : 'from-indigo-500 via-purple-500 to-violet-500';

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className={`p-5 rounded-3xl bg-gradient-to-tr ${gradient} bg-opacity-10 text-white shadow-2xl shadow-purple-500/20 mb-6 border border-white/10 animate-bounce duration-1000`}>
        <Icon className="w-12 h-12 text-white" />
      </div>

      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 mb-3">
        Phase 5.3 Feature Preview
      </span>

      <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight max-w-xl">
        {title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">is Coming Soon</span>
      </h1>

      <p className="mt-4 text-slate-400 text-sm md:text-base max-w-lg leading-relaxed">
        {description}
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
        <input
          type="email"
          placeholder="Enter your work email for priority access"
          className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          onClick={() => alert('Thanks! You are registered for early access.')}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-500/25 shrink-0 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          Notify Me
        </button>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full text-left">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs font-bold text-indigo-400 mb-1">01. Automated Analysis</div>
          <p className="text-xs text-slate-400">Deep learning algorithms scanning ROAS and CPA automatically.</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs font-bold text-purple-400 mb-1">02. Creative Fatigue Alert</div>
          <p className="text-xs text-slate-400">Detect decaying ad creative performance before budget is wasted.</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs font-bold text-pink-400 mb-1">03. Cohort LTV Prediction</div>
          <p className="text-xs text-slate-400">AI-powered 60-day & 90-day customer lifetime value forecasting.</p>
        </div>
      </div>
    </div>
  );
};

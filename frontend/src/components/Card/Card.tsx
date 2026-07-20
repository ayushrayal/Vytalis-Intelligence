import React from 'react';

interface CardProps {
  interactive?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ interactive = false, className = '', children }) => {
  return (
    <div
      className={`rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-xl transition-all ${
        interactive ? 'hover:border-slate-700 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

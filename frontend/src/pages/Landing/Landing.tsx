import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar/Navbar';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import { Shield, TrendingUp, Zap, ShoppingBag } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCTA = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />

      <Navbar onLoginClick={handleCTA} />

      <main className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-6">
          <Zap size={14} /> Connect. Analyze. Scale.
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
          Unified Paid Ad & E-commerce Analytics for{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            DTC Brands
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Eliminate reporting guesswork. Seamlessly integrate Meta Marketing API with Shopify Admin API to calculate real-time Blended ROAS, AOV, and customer metrics.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="primary" size="lg" onClick={handleCTA} id="landing-continue-google-btn">
            Continue with Google
          </Button>
          <Button variant="secondary" size="lg" onClick={handleCTA} id="landing-explore-demo-btn">
            Explore Live Demo
          </Button>
        </div>
      </main>

      <section className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <Card interactive>
          <div className="p-3 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
            <TrendingUp size={28} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Blended ROAS Engine</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Calculate accurate return on ad spend across Meta campaigns matched against Shopify net revenue.
          </p>
        </Card>

        <Card interactive>
          <div className="p-3 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
            <ShoppingBag size={28} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Direct Shopify Sync</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Fetch store orders, top performing SKUs, customer growth, and AOV directly via official GraphQL & REST APIs.
          </p>
        </Card>

        <Card interactive>
          <div className="p-3 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
            <Shield size={28} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">AES-256 Encrypted Security</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Enterprise-grade token encryption, HttpOnly cookies, and strict JWT refresh token revocation.
          </p>
        </Card>
      </section>
    </div>
  );
};

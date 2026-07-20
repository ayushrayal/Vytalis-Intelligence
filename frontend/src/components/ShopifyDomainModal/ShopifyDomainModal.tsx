import React, { useState } from 'react';
import { ShoppingBag, X, ArrowRight } from 'lucide-react';

interface ShopifyDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (domain: string) => void;
}

export const ShopifyDomainModal: React.FC<ShopifyDomainModalProps> = ({
  isOpen,
  onClose,
  onContinue,
}) => {
  const [domain, setDomain] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDomain = domain.trim().toLowerCase();
    if (!cleanDomain) {
      setError('Please enter your Shopify store domain');
      return;
    }
    setError('');
    onContinue(cleanDomain);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          id="shopify-domain-close-btn"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-3">
            <ShoppingBag size={28} />
          </div>
          <h3 className="text-xl font-bold text-white">Connect Shopify Store</h3>
          <p className="text-xs text-slate-400 mt-1">Enter your store domain to initiate secure OAuth 2.0 authorization.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="shopify-domain-input" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Shop Domain
            </label>
            <input
              id="shopify-domain-input"
              type="text"
              placeholder="your-store.myshopify.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {error && <span className="text-xs text-red-400 mt-1 block font-medium">{error}</span>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              id="shopify-domain-cancel-btn"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
              id="shopify-domain-continue-btn"
            >
              <span>Continue to Shopify</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

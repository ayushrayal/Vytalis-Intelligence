import React, { useState } from 'react';
import { Layers, X, Check } from 'lucide-react';

export interface IMetaSimpleAccount {
  id: string;
  name: string;
}

interface MetaAccountModalProps {
  isOpen: boolean;
  accounts: IMetaSimpleAccount[];
  loading: boolean;
  onClose: () => void;
  onSelectAccount: (account: IMetaSimpleAccount) => void;
}

export const MetaAccountModal: React.FC<MetaAccountModalProps> = ({
  isOpen,
  accounts,
  loading,
  onClose,
  onSelectAccount,
}) => {
  const [selectedId, setSelectedId] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) {
      setError('Please select an Ad Account');
      return;
    }
    const acc = accounts.find((a) => a.id === selectedId);
    if (!acc) {
      setError('Invalid account selected');
      return;
    }
    setError('');
    onSelectAccount(acc);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          id="meta-account-close-btn"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-3">
            <Layers size={28} />
          </div>
          <h3 className="text-xl font-bold text-white">Select Ad Account</h3>
          <p className="text-xs text-slate-400 mt-1">Choose the Meta Ad Account you want to connect to Vytalis Intelligence.</p>
        </div>

        {loading ? (
          <div className="py-8 flex flex-col items-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-3" />
            <p>Fetching your Meta Ad Accounts...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="meta-ad-account-select" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Ad Account
              </label>
              <select
                id="meta-ad-account-select"
                value={selectedId}
                onChange={(e) => {
                  setSelectedId(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
              >
                <option value="">-- Select Meta Ad Account --</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.id})
                  </option>
                ))}
              </select>
              {error && <span className="text-xs text-red-400 mt-1 block font-medium">{error}</span>}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                id="meta-account-cancel-btn"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 cursor-pointer"
                id="meta-account-save-btn"
              >
                <span>Save Account</span>
                <Check size={16} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

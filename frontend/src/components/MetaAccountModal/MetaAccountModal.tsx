import React, { useState } from 'react';
import { Layers, X, Check } from 'lucide-react';
import './MetaAccountModal.scss';

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
    <div className="meta-account-modal-overlay">
      <div className="meta-account-modal-card">
        <button onClick={onClose} className="close-btn" id="meta-account-close-btn" aria-label="Close modal">
          <X size={18} />
        </button>

        <div className="modal-header">
          <div className="meta-badge">
            <Layers size={24} color="#1877F2" />
          </div>
          <h3>Select Ad Account</h3>
          <p>Choose the Meta Ad Account you want to connect to Vytalis Intelligence.</p>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Fetching your Meta Ad Accounts...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="input-group">
              <label htmlFor="meta-ad-account-select">Ad Account</label>
              <div className="select-wrapper">
                <select
                  id="meta-ad-account-select"
                  value={selectedId}
                  onChange={(e) => {
                    setSelectedId(e.target.value);
                    setError('');
                  }}
                >
                  <option value="">-- Select Meta Ad Account --</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.id})
                    </option>
                  ))}
                </select>
              </div>
              {error && <span className="error-msg">{error}</span>}
            </div>

            <div className="modal-actions">
              <button type="button" onClick={onClose} className="cancel-btn" id="meta-account-cancel-btn">
                Cancel
              </button>

              <button type="submit" className="continue-btn" id="meta-account-save-btn">
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

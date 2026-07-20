import React, { useState } from 'react';
import { ShoppingBag, X, ArrowRight } from 'lucide-react';
import './ShopifyDomainModal.scss';

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
    <div className="shopify-modal-overlay">
      <div className="shopify-modal-card">
        <button onClick={onClose} className="close-btn" id="shopify-domain-close-btn" aria-label="Close modal">
          <X size={18} />
        </button>

        <div className="modal-header">
          <div className="shopify-badge">
            <ShoppingBag size={24} color="#95BF47" />
          </div>
          <h3>Connect Shopify Store</h3>
          <p>Enter your store domain to initiate secure OAuth 2.0 authorization.</p>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="input-group">
            <label htmlFor="shopify-domain-input">Shop Domain</label>

            <div className="input-wrapper">
              <input
                id="shopify-domain-input"
                type="text"
                placeholder="your-store.myshopify.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                autoFocus
              />
            </div>
            {error && <span className="error-msg">{error}</span>}
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn" id="shopify-domain-cancel-btn">
              Cancel
            </button>

            <button type="submit" className="continue-btn" id="shopify-domain-continue-btn">
              <span>Continue to Shopify</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

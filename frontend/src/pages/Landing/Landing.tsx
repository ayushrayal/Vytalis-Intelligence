import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar/Navbar';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import { Shield, TrendingUp, Zap, ShoppingBag } from 'lucide-react';
import './Landing.scss';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCTA = () => {
    navigate('/login');
  };

  return (
    <div className="vytalis-landing">
      <Navbar onLoginClick={handleCTA} />

      <main className="vytalis-landing__hero">
        <div className="vytalis-landing__tagline">
          <Zap size={14} /> Connect. Analyze. Scale.
        </div>
        <h1 className="vytalis-landing__title">
          Unified Paid Ad & E-commerce Analytics for <span>DTC Brands</span>
        </h1>
        <p className="vytalis-landing__subtitle">
          Eliminate reporting guesswork. Seamlessly integrate Meta Marketing API with Shopify Admin API to calculate real-time Blended ROAS, AOV, and customer metrics.
        </p>
        <div className="vytalis-landing__actions">
          <Button variant="primary" size="lg" onClick={handleCTA} id="landing-continue-google-btn">
            Continue with Google
          </Button>
          <Button variant="secondary" size="lg" onClick={handleCTA} id="landing-explore-demo-btn">
            Explore Live Demo
          </Button>
        </div>
      </main>

      <section className="vytalis-landing__features">
        <Card interactive>
          <TrendingUp size={32} color="#10B981" />
          <h3 className="vytalis-landing__feature-title">Blended ROAS Engine</h3>
          <p className="vytalis-landing__feature-desc">
            Calculate accurate return on ad spend across Meta campaigns matched against Shopify net revenue.
          </p>
        </Card>

        <Card interactive>
          <ShoppingBag size={32} color="#10B981" />
          <h3 className="vytalis-landing__feature-title">Direct Shopify Sync</h3>
          <p className="vytalis-landing__feature-desc">
            Fetch store orders, top performing SKUs, customer growth, and AOV directly via official GraphQL & REST APIs.
          </p>
        </Card>

        <Card interactive>
          <Shield size={32} color="#10B981" />
          <h3 className="vytalis-landing__feature-title">AES-256 Encrypted Security</h3>
          <p className="vytalis-landing__feature-desc">
            Enterprise-grade token encryption, HttpOnly cookies, and strict JWT refresh token revocation.
          </p>
        </Card>
      </section>
    </div>
  );
};

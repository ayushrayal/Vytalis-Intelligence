import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import {
  Check,
  X,
  Zap,
  Sparkles,
  TrendingUp,
  Shield,
  ArrowRight,
  Star,
  Bot,
} from 'lucide-react';
import './PricingPage.scss';

interface PricingPlanItem {
  id: 'starter' | 'growth' | 'agency';
  name: string;
  price: string;
  period: string;
  trialBadge?: string;
  badge?: string;
  description: string;
  features: string[];
  restrictions: string[];
  highlighted?: boolean;
}

const PRICING_PLANS: PricingPlanItem[] = [
  {
    id: 'starter',
    name: 'Starter Trial',
    price: '₹0',
    period: 'for 7 days',
    trialBadge: '7 Days Free Trial',
    description: 'Perfect for emerging brands to test store connection and baseline KPIs.',
    features: [
      'Dashboard Access',
      'Connect Meta Account',
      'Connect Shopify Store',
      'Total Spend Tracking',
      'Total Revenue Tracking',
      'Purchases Count',
      'Basic KPI Cards',
    ],
    restrictions: [
      'No Creative Analytics',
      'No ROAS Breakdown',
      'No AI Insights',
      'No Export Data',
      'No Advanced Reports',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '₹1,999',
    period: '/ month',
    description: 'For scaling e-commerce brands needing full attribution and campaign breakdowns.',
    features: [
      'Everything in Starter',
      'Meta Performance Overview',
      'Shopify Order Overview',
      'Revenue & Spend Analytics',
      'ROAS & CTR Tracking',
      'Interactive Campaign Table',
      'Last 30 Days Data History',
      'Age & Gender Breakdowns',
      'Placement & Device Analytics',
    ],
    restrictions: [
      'No Creative Analytics',
      'No Hook Rate & Hold Rate',
      'No AI Insights Engine',
      'No CSV Export',
      'No Multi-Touch Attribution',
    ],
  },
  {
    id: 'agency',
    name: 'Agency',
    price: '₹4,999',
    period: '/ month',
    badge: 'Most Popular',
    description: 'Unlimited intelligence suite with video analytics, AI insights & export.',
    highlighted: true,
    features: [
      'Everything in Growth',
      'Creative Analytics Suite',
      'Hook Rate & Hold Rate',
      'Video Retention Curves',
      'ROAS Analysis & Forecasting',
      'Advanced Custom Reports',
      'Export CSV & PDF Data',
      'Vytalis AI Insights Engine',
      'Multi-Touch Attribution',
      'Unlimited Historical Data',
      '24/7 Priority Support',
    ],
    restrictions: [],
  },
];

export const PricingPage: React.FC = () => {
  const { user, completeOnboarding } = useAuth();
  const [selectedPlanId, setSelectedPlanId] = useState<'starter' | 'growth' | 'agency'>(
    user?.subscription?.plan || 'agency'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSelectPlan = async (planId: 'starter' | 'growth' | 'agency') => {
    try {
      setIsSubmitting(true);
      setSelectedPlanId(planId);
      await completeOnboarding(planId);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Failed to update plan', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <div className="pricing-container">
      <div className="bg-glow bg-glow-top" />
      <div className="bg-glow bg-glow-bottom" />

      <header className="pricing-header">
        <div className="brand-badge" onClick={() => navigate('/dashboard')}>
          <Zap className="brand-icon" />
          <span>Vytalis Intelligence</span>
        </div>
        <p className="pricing-tagline">V1 Enterprise Pricing Matrix</p>
      </header>

      <main className="pricing-main">
        <div className="hero-text">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="chip"
          >
            <Sparkles className="chip-icon" />
            <span>Select Your Operating Tier</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Transparent Plans for Maximum Revenue ROAS
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Start with our 7-Day Free Starter Trial or unlock full Creative Analytics & AI Insights.
          </motion.p>
        </div>

        <motion.div
          className="pricing-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {PRICING_PLANS.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            return (
              <motion.div
                key={plan.id}
                variants={cardVariants}
                className={`pricing-card ${plan.highlighted ? 'highlighted' : ''} ${
                  isSelected ? 'selected' : ''
                }`}
                onClick={() => setSelectedPlanId(plan.id)}
              >
                {plan.badge && (
                  <div className="popular-badge">
                    <Star className="star-icon" />
                    <span>{plan.badge}</span>
                  </div>
                )}

                {plan.trialBadge && <div className="trial-badge">{plan.trialBadge}</div>}

                <div className="card-header">
                  <h3 className="plan-title">{plan.name}</h3>
                  <p className="plan-description">{plan.description}</p>
                </div>

                <div className="card-price">
                  <span className="price">{plan.price}</span>
                  <span className="period">{plan.period}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPlan(plan.id);
                  }}
                  disabled={isSubmitting}
                  className={`select-btn ${plan.highlighted ? 'btn-highlight' : 'btn-standard'}`}
                  id={`select-plan-${plan.id}-btn`}
                >
                  <span>
                    {isSubmitting && selectedPlanId === plan.id
                      ? 'Processing...'
                      : plan.id === 'starter'
                      ? 'Start 7-Day Free Trial'
                      : `Get Started with ${plan.name}`}
                  </span>
                  <ArrowRight className="arrow-icon" />
                </button>

                <div className="features-list">
                  <p className="list-heading">INCLUDED FEATURES</p>
                  <ul>
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="feature-item">
                        <Check className="check-icon" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.restrictions.length > 0 && (
                    <>
                      <p className="list-heading restrictions-heading">RESTRICTIONS</p>
                      <ul>
                        {plan.restrictions.map((restr, idx) => (
                          <li key={idx} className="restriction-item">
                            <X className="x-icon" />
                            <span>{restr}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="trust-grid">
          <div className="trust-item">
            <Shield className="trust-icon" />
            <div>
              <h4>256-Bit SSL Encrypted</h4>
              <p>Bank-grade security standards for Meta & Shopify OAuth data tokens.</p>
            </div>
          </div>
          <div className="trust-item">
            <TrendingUp className="trust-icon" />
            <div>
              <h4>Real-time Synchronization</h4>
              <p>Instant revenue attribution & live ROAS updates.</p>
            </div>
          </div>
          <div className="trust-item">
            <Bot className="trust-icon" />
            <div>
              <h4>AI Engine Included</h4>
              <p>Automated anomaly detection and ad spend optimizer.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PricingPage;

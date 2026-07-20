import React from 'react';
import { Activity } from 'lucide-react';
import { Button } from '../Button/Button';
import './Navbar.scss';

interface NavbarProps {
  onLoginClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLoginClick }) => {
  return (
    <header className="vytalis-navbar">
      <div className="vytalis-navbar__container">
        <a href="/" className="vytalis-navbar__brand">
          <Activity size={24} />
          <span>Vytalis Intelligence</span>
        </a>
        <div className="vytalis-navbar__actions">
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

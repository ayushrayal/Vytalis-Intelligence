import React from 'react';
import './Card.scss';

interface CardProps {
  interactive?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ interactive = false, className = '', children }) => {
  return (
    <div className={`vytalis-card ${interactive ? 'vytalis-card--interactive' : ''} ${className}`}>
      {children}
    </div>
  );
};


import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, footer }) => {
  return (
    <div className={`bg-surface shadow-lg rounded-xl p-6 ${className}`}>
      {title && <h2 className="text-2xl font-bold text-text-main mb-4 border-b border-secondary pb-2">{title}</h2>}
      <div>{children}</div>
      {footer && <div className="mt-4 pt-4 border-t border-secondary">{footer}</div>}
    </div>
  );
};

import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  bordered?: boolean;
  hoverable?: boolean;
  className?: string;
}

export const Card = ({
  children,
  title,
  subtitle,
  footer,
  bordered = true,
  hoverable = false,
  className = '',
}: CardProps) => {
  return (
    <div
      className={`
        bg-white rounded-lg overflow-hidden
        ${bordered ? 'border border-gray-200' : ''}
        ${hoverable ? 'transition-shadow hover:shadow-lg' : ''}
        ${className}
      `}
    >
      {(title || subtitle) && (
        <div className="p-4 border-b border-gray-200">
          {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}
      <div className="p-4">{children}</div>
      {footer && <div className="p-4 bg-gray-50 border-t border-gray-200">{footer}</div>}
    </div>
  );
};

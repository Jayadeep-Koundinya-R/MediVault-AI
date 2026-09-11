import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'normal' | 'success' | 'warning' | 'critical' | 'danger' | 'trust' | 'neutral' | 'info';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 leading-tight',
    md: 'text-xs px-2.5 py-1 leading-normal'
  };

  const normalizedVariant = 
    variant === 'success' ? 'normal' :
    variant === 'danger' ? 'critical' :
    variant;

  const variantClasses = {
    normal: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200/80',
    critical: 'bg-rose-50 text-rose-800 border border-rose-200/80',
    trust: 'bg-indigo-50 text-indigo-700 border border-indigo-200/80',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
    info: 'bg-blue-50 text-blue-800 border border-blue-200/80'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full ${sizeClasses[size]} ${variantClasses[normalizedVariant]} ${className}`}>
      {normalizedVariant === 'normal' && !icon && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>}
      {normalizedVariant === 'warning' && !icon && <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>}
      {normalizedVariant === 'critical' && !icon && <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

export default Badge;

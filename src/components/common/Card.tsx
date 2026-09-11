import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'elevated' | 'alert';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const variantClasses = {
    default: 'bg-white border border-slate-200 shadow-sm',
    subtle: 'bg-slate-50 border border-slate-200/60',
    elevated: 'bg-white border border-slate-200 shadow-md',
    alert: 'bg-amber-50/40 border border-amber-200 shadow-sm'
  };

  return (
    <div className={`rounded-xl transition-all duration-200 ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;

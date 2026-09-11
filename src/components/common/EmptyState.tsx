import React from 'react';
import { Button } from './Button';
import { FileQuestion } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  primaryActionText?: string;
  onPrimaryAction?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <FileQuestion size={40} className="text-slate-400" />,
  title,
  description,
  primaryActionText,
  onPrimaryAction,
  actionLabel,
  onAction,
  secondaryActionText,
  onSecondaryAction
}) => {
  const effectivePrimaryText = primaryActionText || actionLabel;
  const effectivePrimaryAction = onPrimaryAction || onAction;

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-2xl border border-slate-200/80 shadow-sm max-w-lg mx-auto my-6">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 text-teal-800">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1.5">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        {effectivePrimaryText && effectivePrimaryAction && (
          <Button onClick={effectivePrimaryAction} variant="primary" className="w-full sm:w-auto">
            {effectivePrimaryText}
          </Button>
        )}
        {secondaryActionText && onSecondaryAction && (
          <Button onClick={onSecondaryAction} variant="secondary" className="w-full sm:w-auto">
            {secondaryActionText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;

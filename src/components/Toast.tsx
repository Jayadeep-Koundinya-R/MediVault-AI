import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const TOAST_DURATION = 4000;

const ToastNotification: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss(toast.id), 300);
    }, TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <CheckCircle2 size={18} />;
      case 'error': return <AlertTriangle size={18} />;
      case 'info': return <Info size={18} />;
    }
  };

  const typeClass = `toast-${toast.type}`;

  return (
    <div className={`toast-item ${typeClass} ${isExiting ? 'toast-exit' : 'toast-enter'}`}>
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-content">
        <div className="toast-title">{toast.title}</div>
        {toast.message && <div className="toast-message">{toast.message}</div>}
      </div>
      <button
        className="toast-close"
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onDismiss(toast.id), 300);
        }}
      >
        <X size={14} />
      </button>
      <div className="toast-progress">
        <div className="toast-progress-bar" style={{ animationDuration: `${TOAST_DURATION}ms` }} />
      </div>
    </div>
  );
};

// Global toast manager
let addToastFn: ((toast: Omit<ToastItem, 'id'>) => void) | null = null;

export const showToast = (type: ToastType, title: string, message?: string) => {
  if (addToastFn) {
    addToastFn({ type, title, message });
  }
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => { addToastFn = null; };
  }, [addToast]);

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <ToastNotification key={t.id} toast={t} onDismiss={dismissToast} />
      ))}
    </div>
  );
};

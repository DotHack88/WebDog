import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function NotificationToast({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="text-emerald-500 flex-shrink-0" size={24} style={{ color: '#10b981' }} />;
      case 'error':
        return <AlertCircle className="text-red-500 flex-shrink-0" size={24} style={{ color: '#ef4444' }} />;
      case 'warning':
        return <AlertCircle className="text-amber-500 flex-shrink-0" size={24} style={{ color: '#f59e0b' }} />;
      default:
        return <Info className="text-sky-500 flex-shrink-0" size={24} style={{ color: '#0284c7' }} />;
    }
  };

  const getToastClass = () => {
    switch (toast.type) {
      case 'success':
        return 'toast toast-success';
      case 'error':
        return 'toast toast-error';
      case 'warning':
        return 'toast toast-warning';
      default:
        return 'toast toast-info';
    }
  };

  return (
    <div className={getToastClass()}>
      {getIcon()}
      <div style={{ flex: 1 }}>
        <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '2px' }}>{toast.title}</h4>
        <p style={{ fontSize: '0.85rem', color: '#475569' }}>{toast.message}</p>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
          Canale: {toast.channel}
        </span>
      </div>
      <button 
        onClick={onClose}
        style={{ 
          background: 'transparent', 
          border: 'none', 
          cursor: 'pointer', 
          color: '#94a3b8',
          height: 'fit-content'
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}

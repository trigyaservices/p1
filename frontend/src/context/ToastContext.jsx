import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col space-y-3 max-w-md w-full pointer-events-none">
        {toasts.map(toast => {
          let bg = 'bg-white border-emerald-500 text-emerald-900';
          let icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />;

          if (toast.type === 'error') {
            bg = 'bg-white border-red-500 text-red-900';
            icon = <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />;
          } else if (toast.type === 'info') {
            bg = 'bg-white border-teal-500 text-teal-900';
            icon = <Info className="w-5 h-5 text-teal-600 flex-shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start justify-between p-4 rounded-xl border-l-4 shadow-lg transition-all duration-300 transform translate-y-0 ${bg}`}
            >
              <div className="flex items-start space-x-3">
                {icon}
                <p className="text-sm font-medium leading-5">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-600 ml-3 -mr-1 -mt-1 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

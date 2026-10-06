import React, { createContext, useContext, useState, useCallback } from 'react';

interface ToastContextType {
  showToast: (message: React.ReactNode, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: React.ReactNode;
    duration: number;
  }>>([]);

  const showToast = useCallback((message: React.ReactNode, duration: number = 4000) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, duration }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Render toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-md animate-in slide-in-from-right-full duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-2 text-gray-400 hover:text-gray-600 flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
